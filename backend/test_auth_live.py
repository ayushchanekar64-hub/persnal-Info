import httpx
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    results = []

    def record(name, passed, detail=""):
        status_str = "PASS" if passed else "FAIL"
        results.append((name, passed, detail))
        print(f"[{status_str}] {name}: {detail}")

    # 1. Health check
    try:
        r = client.get("/health")
        record("GET /health", r.status_code == 200 and r.json().get("status") == "healthy", f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("GET /health", False, f"Connection error: {e}")
        return results

    # 2. Root check
    try:
        r = client.get("/")
        record("GET /", r.status_code == 200 and r.json().get("status") == "online", f"Status: {r.status_code}")
    except Exception as e:
        record("GET /", False, str(e))

    # Generate test user
    uid = uuid.uuid4().hex[:8]
    test_email = f"test_auth_{uid}@example.com"
    test_password = "SecurePassword123!"
    test_pin = "654321"

    # 3. Registration
    token = None
    try:
        r = client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": test_password,
            "name": f"Test User {uid}",
            "recovery_pin": test_pin,
            "role": "Engineer",
            "tagline": "Testing authentication"
        })
        if r.status_code == 201:
            data = r.json()
            token = data.get("access_token")
            record("POST /api/v1/auth/register", bool(token), f"Created user {test_email}")
        else:
            record("POST /api/v1/auth/register", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("POST /api/v1/auth/register", False, str(e))

    # 4. Duplicate Registration (Should fail with 400)
    try:
        r = client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": test_password
        })
        record("POST /api/v1/auth/register (Duplicate prevention)", r.status_code == 400, f"Expected 400, got {r.status_code}")
    except Exception as e:
        record("POST /api/v1/auth/register (Duplicate prevention)", False, str(e))

    # 5. Login
    login_token = None
    try:
        r = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        if r.status_code == 200:
            login_token = r.json().get("access_token")
            record("POST /api/v1/auth/login", bool(login_token), "Login successful")
        else:
            record("POST /api/v1/auth/login", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("POST /api/v1/auth/login", False, str(e))

    # 6. Login with invalid password
    try:
        r = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "WrongPassword!"
        })
        record("POST /api/v1/auth/login (Invalid Password)", r.status_code == 401, f"Expected 401, got {r.status_code}")
    except Exception as e:
        record("POST /api/v1/auth/login (Invalid Password)", False, str(e))

    # 7. Authenticated GET /api/v1/auth/me
    headers = {"Authorization": f"Bearer {login_token or token}"}
    try:
        r = client.get("/api/v1/auth/me", headers=headers)
        if r.status_code == 200 and r.json().get("email") == test_email:
            record("GET /api/v1/auth/me", True, f"User email matches: {r.json().get('email')}")
        else:
            record("GET /api/v1/auth/me", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("GET /api/v1/auth/me", False, str(e))

    # 8. Authenticated PATCH /api/v1/auth/me
    try:
        r = client.patch("/api/v1/auth/me", headers=headers, json={
            "tagline": "Updated tagline test",
            "name": f"Updated Name {uid}"
        })
        if r.status_code == 200 and r.json().get("tagline") == "Updated tagline test":
            record("PATCH /api/v1/auth/me", True, "Profile updated successfully")
        else:
            record("PATCH /api/v1/auth/me", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("PATCH /api/v1/auth/me", False, str(e))

    # 9. Set Recovery PIN (Authenticated)
    new_pin = "112233"
    try:
        r = client.post("/api/v1/auth/set-recovery-pin", headers=headers, json={
            "recovery_pin": new_pin
        })
        record("POST /api/v1/auth/set-recovery-pin", r.status_code == 200, f"Status: {r.status_code}")
    except Exception as e:
        record("POST /api/v1/auth/set-recovery-pin", False, str(e))

    # 10. Recovery Flow Step 1: Verify Identifier
    rec_token_1 = None
    try:
        r = client.post("/api/v1/auth/recovery/verify-identifier", json={
            "identifier": test_email
        })
        if r.status_code == 200:
            data = r.json()
            rec_token_1 = data.get("recovery_token")
            record("POST /api/v1/auth/recovery/verify-identifier", bool(rec_token_1) and data.get("has_pin") is True, f"Masked: {data.get('masked_identifier')}")
        else:
            record("POST /api/v1/auth/recovery/verify-identifier", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("POST /api/v1/auth/recovery/verify-identifier", False, str(e))

    # 11. Recovery Flow Step 2: Verify Wrong PIN (should reject)
    if rec_token_1:
        try:
            r = client.post("/api/v1/auth/recovery/verify-pin", json={
                "recovery_token": rec_token_1,
                "recovery_pin": "999999"
            })
            record("POST /api/v1/auth/recovery/verify-pin (Wrong PIN rejection)", r.status_code == 400, f"Expected 400, got {r.status_code}")
        except Exception as e:
            record("POST /api/v1/auth/recovery/verify-pin (Wrong PIN rejection)", False, str(e))

    # 12. Recovery Flow Step 2: Verify Correct PIN
    reset_token = None
    if rec_token_1:
        try:
            r = client.post("/api/v1/auth/recovery/verify-pin", json={
                "recovery_token": rec_token_1,
                "recovery_pin": new_pin
            })
            if r.status_code == 200:
                reset_token = r.json().get("reset_token")
                record("POST /api/v1/auth/recovery/verify-pin (Correct PIN)", bool(reset_token), "Reset token obtained")
            else:
                record("POST /api/v1/auth/recovery/verify-pin (Correct PIN)", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
        except Exception as e:
            record("POST /api/v1/auth/recovery/verify-pin (Correct PIN)", False, str(e))

    # 13. Recovery Flow Step 3: Reset Password
    new_password = "BrandNewPassword456!"
    if reset_token:
        try:
            r = client.post("/api/v1/auth/recovery/reset-password", json={
                "reset_token": reset_token,
                "new_password": new_password
            })
            record("POST /api/v1/auth/recovery/reset-password", r.status_code == 200, f"Status: {r.status_code}")
        except Exception as e:
            record("POST /api/v1/auth/recovery/reset-password", False, str(e))

    # 14. Login with Old Password (should fail)
    try:
        r = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        record("POST /api/v1/auth/login (Old password after reset)", r.status_code == 401, f"Expected 401, got {r.status_code}")
    except Exception as e:
        record("POST /api/v1/auth/login (Old password after reset)", False, str(e))

    # 15. Login with New Password (should succeed)
    new_login_token = None
    try:
        r = client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": new_password
        })
        if r.status_code == 200:
            new_login_token = r.json().get("access_token")
            record("POST /api/v1/auth/login (New password after reset)", bool(new_login_token), "Logged in with new password")
        else:
            record("POST /api/v1/auth/login (New password after reset)", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("POST /api/v1/auth/login (New password after reset)", False, str(e))

    # 16. Token Invalidation check: Old access token should be rejected because token_version was incremented
    try:
        r = client.get("/api/v1/auth/me", headers=headers)
        record("GET /api/v1/auth/me (Old JWT session revocation)", r.status_code == 401, f"Expected 401, got {r.status_code}")
    except Exception as e:
        record("GET /api/v1/auth/me (Old JWT session revocation)", False, str(e))

    # 17. Google OAuth endpoint
    google_email = f"google_user_{uid}@gmail.com"
    try:
        r = client.post("/api/v1/auth/google", json={
            "email": google_email,
            "name": f"Google User {uid}",
            "avatar": "https://example.com/avatar.png"
        })
        if r.status_code == 200:
            g_token = r.json().get("access_token")
            record("POST /api/v1/auth/google", bool(g_token), f"Google auth success for {google_email}")
        else:
            record("POST /api/v1/auth/google", False, f"Status: {r.status_code}, Body: {r.text.strip()}")
    except Exception as e:
        record("POST /api/v1/auth/google", False, str(e))

    total = len(results)
    passed_count = sum(1 for _, p, _ in results if p)
    print("\n" + "="*50)
    print(f"AUTH BACKEND TEST SUMMARY: {passed_count}/{total} PASSED")
    print("="*50)
    return results

if __name__ == "__main__":
    run_tests()
