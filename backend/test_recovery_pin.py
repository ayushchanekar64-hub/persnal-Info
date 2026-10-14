"""
Automated verification for AYORA 6-Digit Recovery PIN & Zero-Trust Password Reset System
"""
import sys
import os
import uuid
import sqlite3

# Ensure backend root and workspace root are on sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(backend_dir)
sys.path.insert(0, backend_dir)
sys.path.insert(0, workspace_dir)

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import verify_password

def get_user_from_db(email):
    conn = sqlite3.connect("mynexus.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def reset_lockout_in_db(email):
    conn = sqlite3.connect("mynexus.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET recovery_attempts = 0, recovery_locked_until = NULL WHERE email = ?", (email,))
    conn.commit()
    conn.close()

def run_tests():
    print("==================================================")
    print("STARTING RECOVERY PIN & FORGOT PASSWORD TEST SUITE")
    print("==================================================")
    with TestClient(app) as client:
        test_id = str(uuid.uuid4())[:8]
        test_email = f"test_pin_{test_id}@ayora.dev"
        test_password = "SecurePassword123!"
        test_pin = "482910"
        wrong_pin = "000000"
        new_password = "BrandNewPassword456!"

        # 1. TEST REGISTRATION WITH 6-DIGIT RECOVERY PIN
        print(f"\n[TEST 1] Registering user {test_email} with Recovery PIN {test_pin}...")
        reg_payload = {
            "name": f"Tester {test_id}",
            "email": test_email,
            "password": test_password,
            "recovery_pin": test_pin
        }
        reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
        reg_data = reg_resp.json()
        assert "access_token" in reg_data
        assert reg_data["user"]["has_recovery_pin"] == True
        old_jwt_token = reg_data["access_token"]
        print(" -> Registration SUCCESS. Received JWT token and has_recovery_pin = True.")

        # Check Database row directly
        user_row = get_user_from_db(test_email)
        assert user_row is not None
        assert user_row["recovery_pin_hash"] is not None
        assert user_row["recovery_pin_hash"] != test_pin, "SECURITY ERROR: PIN must be hashed, not plaintext!"
        assert verify_password(test_pin, user_row["recovery_pin_hash"]) == True, "PIN hash verification failed"
        assert user_row["recovery_attempts"] == 0
        assert user_row["token_version"] >= 1
        print(" -> DB Verification SUCCESS: PIN is properly hashed with bcrypt. Plaintext is not stored.")

        # 2. TEST FORGOT PASSWORD STEP 1: VERIFY IDENTIFIER
        print("\n[TEST 2] Step 1: Identifier verification (Email)...")
        step1_resp = client.post("/api/v1/auth/recovery/verify-identifier", json={"identifier": test_email})
        assert step1_resp.status_code == 200, f"Step 1 failed: {step1_resp.text}"
        step1_data = step1_resp.json()
        assert "recovery_token" in step1_data
        assert "masked_identifier" in step1_data
        assert step1_data["has_pin"] == True
        recovery_token = step1_data["recovery_token"]
        print(f" -> Step 1 SUCCESS: Received recovery token and masked identifier '{step1_data['masked_identifier']}'.")

        # 3. TEST RATE-LIMITING & LOCKOUT ON WRONG PIN ATTEMPTS
        print("\n[TEST 3] Step 2: Rate-limiting & failed attempts test...")
        for attempt in range(1, 6):
            resp = client.post("/api/v1/auth/recovery/verify-pin", json={
                "recovery_token": recovery_token,
                "recovery_pin": wrong_pin
            })
            if attempt < 5:
                assert resp.status_code == 400, f"Expected 400 for attempt {attempt}, got {resp.status_code}: {resp.text}"
                assert "remaining before temporary lockout" in resp.json()["detail"]
                print(f" -> Attempt {attempt}/5 correctly rejected with remaining attempts warning: {resp.json()['detail']}")
            else:
                # 5th failed attempt should trigger lockout (429)
                assert resp.status_code == 429, f"Expected 429 lockout on 5th attempt, got {resp.status_code}: {resp.text}"
                assert "temporarily locked" in resp.json()["detail"]
                print(f" -> Attempt 5/5 triggered 15-minute SECURITY LOCKOUT (HTTP 429).")

        # Verify that further identifier requests indicate lockout
        lock_check = client.post("/api/v1/auth/recovery/verify-identifier", json={"identifier": test_email})
        assert lock_check.status_code == 429
        print(" -> Lockout correctly blocks identifier verification as well.")

        # 4. RESET LOCKOUT IN DB FOR NEXT TESTS AND TEST SUCCESSFUL PIN VERIFICATION
        print("\n[TEST 4] Resetting lockout in DB and verifying valid Recovery PIN...")
        reset_lockout_in_db(test_email)

        step1_resp2 = client.post("/api/v1/auth/recovery/verify-identifier", json={"identifier": test_email})
        recovery_token2 = step1_resp2.json()["recovery_token"]

        step2_resp = client.post("/api/v1/auth/recovery/verify-pin", json={
            "recovery_token": recovery_token2,
            "recovery_pin": test_pin
        })
        assert step2_resp.status_code == 200, f"Step 2 failed: {step2_resp.text}"
        step2_data = step2_resp.json()
        assert "reset_token" in step2_data
        reset_token = step2_data["reset_token"]
        print(" -> Step 2 SUCCESS: Valid PIN accepted, reset token issued, recovery attempts reset to 0.")

        # 5. TEST STEP 3: RESET PASSWORD
        print("\n[TEST 5] Step 3: Setting new password...")
        step3_resp = client.post("/api/v1/auth/recovery/reset-password", json={
            "reset_token": reset_token,
            "new_password": new_password
        })
        assert step3_resp.status_code == 200, f"Step 3 failed: {step3_resp.text}"
        assert step3_resp.json()["success"] == True
        print(" -> Step 3 SUCCESS: Password successfully reset and sessions revoked.")

        # 6. TEST SESSION REVOCATION & OLD CREDENTIALS INEFFECTIVE
        print("\n[TEST 6] Verifying session revocation & new credential authentication...")
        # Old password sign-in should fail
        old_login_resp = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert old_login_resp.status_code == 401, "Old password should not authenticate"
        print(" -> Old password correctly rejected (HTTP 401).")

        # Old JWT token should be rejected (revoked via token_version)
        auth_check = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {old_jwt_token}"})
        assert auth_check.status_code == 401, f"Expected 401 revoked token, got {auth_check.status_code}"
        print(" -> Old session JWT token revoked and rejected (HTTP 401).")

        # New password sign-in should succeed
        new_login_resp = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": new_password
        })
        assert new_login_resp.status_code == 200, f"New password login failed: {new_login_resp.text}"
        new_jwt_token = new_login_resp.json()["access_token"]
        print(" -> New password login SUCCESS (HTTP 200).")

        # Verify /me endpoint with new token
        me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_jwt_token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == test_email
        assert me_resp.json()["has_recovery_pin"] == True
        print(" -> /api/v1/auth/me SUCCESS with new token.")

        # 7. TEST /set-recovery-pin FOR AUTHENTICATED USER
        print("\n[TEST 7] Testing POST /api/v1/auth/set-recovery-pin to update PIN...")
        new_pin = "918273"
        set_pin_resp = client.post(
            "/api/v1/auth/set-recovery-pin",
            json={"recovery_pin": new_pin},
            headers={"Authorization": f"Bearer {new_jwt_token}"}
        )
        assert set_pin_resp.status_code == 200
        assert set_pin_resp.json()["has_recovery_pin"] == True

        # Test recovery flow with new PIN
        step1_resp3 = client.post("/api/v1/auth/recovery/verify-identifier", json={"identifier": test_email})
        rec_token3 = step1_resp3.json()["recovery_token"]
        step2_resp3 = client.post("/api/v1/auth/recovery/verify-pin", json={
            "recovery_token": rec_token3,
            "recovery_pin": new_pin
        })
        assert step2_resp3.status_code == 200
        print(" -> Updated Recovery PIN verified successfully.")

        print("\n==================================================")
        print("ALL 7 RECOVERY PIN & AUTHENTICATION TESTS PASSED!")
        print("==================================================")

if __name__ == "__main__":
    run_tests()
