import asyncio
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.config import settings
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.schemas.user import UserCreate, UserLogin, GoogleAuthRequest, RecoveryVerifyIdentifierRequest, RecoveryVerifyPinRequest, RecoveryResetPasswordRequest
from backend.app.api.v1.auth import register, login, google_auth, recovery_verify_identifier, recovery_verify_pin, recovery_reset_password
from fastapi import HTTPException


async def run_tests():
    print("Initializing DB...")
    await init_db()
    
    test_email = f"test_secure_{os.urandom(4).hex()}@example.com"
    weak_password = "password1" # missing uppercase, special char
    strong_password = "SecurePassword@2026!"
    recovery_pin = "123456"
    
    print(f"\n--- TEST 1: Register without Master Passkey ---")
    async with AsyncSessionLocal() as db:
        try:
            req = UserCreate(
                email=test_email,
                password=strong_password,
                name="Security Test User",
                recovery_pin=recovery_pin,
                access_key=None
            )
            await register(req, db)
            print("❌ FAILED: Register allowed without passkey!")
        except HTTPException as e:
            assert e.status_code == 403, f"Expected 403, got {e.status_code}"
            print(f"[PASSED]: Blocked without passkey: {e.detail}")

    print(f"\n--- TEST 2: Register with invalid Master Passkey ---")
    async with AsyncSessionLocal() as db:
        try:
            req = UserCreate(
                email=test_email,
                password=strong_password,
                name="Security Test User",
                recovery_pin=recovery_pin,
                access_key="WRONG-KEY"
            )
            await register(req, db)
            print("❌ FAILED: Register allowed with wrong passkey!")
        except HTTPException as e:
            assert e.status_code == 403, f"Expected 403, got {e.status_code}"
            print(f"[PASSED]: Blocked with wrong passkey: {e.detail}")

    print(f"\n--- TEST 3: Register with weak password ---")
    async with AsyncSessionLocal() as db:
        try:
            req = UserCreate(
                email=test_email,
                password=weak_password,
                name="Security Test User",
                recovery_pin=recovery_pin,
                access_key=settings.REGISTRATION_ACCESS_KEY
            )
            await register(req, db)
            print("❌ FAILED: Register allowed with weak password!")
        except HTTPException as e:
            assert e.status_code == 400, f"Expected 400, got {e.status_code}"
            print(f"[PASSED]: Blocked weak password: {e.detail}")

    print(f"\n--- TEST 4: Register with VALID passkey & strong password ---")
    async with AsyncSessionLocal() as db:
        req = UserCreate(
            email=test_email,
            password=strong_password,
            name="Security Test User",
            recovery_pin=recovery_pin,
            access_key=settings.REGISTRATION_ACCESS_KEY
        )
        token_res = await register(req, db)
        assert token_res.access_token is not None
        print(f"[PASSED]: Account registered successfully with passkey: {token_res.user.email}")

    print(f"\n--- TEST 5: Login brute-force lockout (5 attempts) ---")
    for attempt in range(1, 6):
        async with AsyncSessionLocal() as db:
            try:
                login_req = UserLogin(email=test_email, password="WrongPassword@123")
                await login(login_req, db)
                print("❌ FAILED: Login succeeded with wrong password!")
            except HTTPException as e:
                if attempt < 5:
                    assert e.status_code == 401, f"Attempt {attempt}: expected 401, got {e.status_code}"
                    print(f"  Attempt {attempt}/5 blocked: {e.detail}")
                else:
                    assert e.status_code == 429, f"Attempt 5: expected 429 Lockout, got {e.status_code}"
                    print(f"[PASSED]: 5th attempt triggered security lockout: {e.detail}")

    print(f"\n--- TEST 6: Subsequent login attempt during lockout ---")
    async with AsyncSessionLocal() as db:
        try:
            login_req = UserLogin(email=test_email, password=strong_password) # Even correct password
            await login(login_req, db)
            print("❌ FAILED: Login succeeded during lockout!")
        except HTTPException as e:
            assert e.status_code == 429, f"Expected 429, got {e.status_code}"
            print(f"[PASSED]: Even correct password rejected during active lockout: {e.detail}")

    print(f"\n--- TEST 7: Unlock via Recovery PIN ---")
    async with AsyncSessionLocal() as db:
        # Step 1: Verify identifier
        id_res = await recovery_verify_identifier(RecoveryVerifyIdentifierRequest(identifier=test_email), db)
        assert id_res.recovery_token is not None
        # Step 2: Verify PIN
        pin_res = await recovery_verify_pin(RecoveryVerifyPinRequest(recovery_token=id_res.recovery_token, recovery_pin=recovery_pin), db)
        assert pin_res.reset_token is not None
        # Step 3: Reset password
        new_strong_pwd = "NewSecurePassword#2026!"
        reset_res = await recovery_reset_password(RecoveryResetPasswordRequest(reset_token=pin_res.reset_token, new_password=new_strong_pwd), db)
        assert reset_res["success"] is True
        print(f"[PASSED]: Password reset via 6-digit Recovery PIN successful.")

    print(f"\n--- TEST 8: Login after Recovery PIN unlock ---")
    async with AsyncSessionLocal() as db:
        login_req = UserLogin(email=test_email, password=new_strong_pwd)
        token_res = await login(login_req, db)
        assert token_res.access_token is not None
        print(f"[PASSED]: Logged in successfully after recovery PIN unlock: {token_res.user.email}")

    print(f"\n--- TEST 9: Google Auth with unregistered account without passkey ---")
    random_google_email = f"google_unauth_{os.urandom(4).hex()}@gmail.com"
    async with AsyncSessionLocal() as db:
        try:
            g_req = GoogleAuthRequest(
                email=random_google_email,
                name="Random Google User",
                access_key=None
            )
            await google_auth(g_req, db)
            print("❌ FAILED: Unregistered Google account allowed in without passkey!")
        except HTTPException as e:
            assert e.status_code == 403, f"Expected 403, got {e.status_code}"
            print(f"[PASSED]: Unregistered Google account rejected: {e.detail}")

    print(f"\n--- TEST 10: Google Auth with unregistered account WITH valid passkey ---")
    async with AsyncSessionLocal() as db:
        g_req = GoogleAuthRequest(
            email=random_google_email,
            name="Authorized Google User",
            access_key=settings.REGISTRATION_ACCESS_KEY
        )
        token_res = await google_auth(g_req, db)
        assert token_res.access_token is not None
        print(f"[PASSED]: Google account registered with passkey: {token_res.user.email}")

    print("\n==========================================")
    print("SUCCESS: ALL 10 STRONG AUTHENTICATION TESTS PASSED!")
    print("==========================================")


if __name__ == "__main__":
    asyncio.run(run_tests())
