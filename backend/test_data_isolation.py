import asyncio
import sys
import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def run_security_tests():
    print("================================================================")
    print("AYORA SECURITY & MULTI-USER DATA ISOLATION TEST SUITE")
    print("================================================================")

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Register User A
        timestamp = int(asyncio.get_event_loop().time() * 1000)
        email_a = f"alice_{timestamp}@ayora.test"
        pwd_a = "SecretAlice@123"
        print(f"\n[1] Registering User A ({email_a})...")
        res_a = await client.post("/auth/register", json={
            "email": email_a,
            "password": pwd_a,
            "name": "Alice Security"
        })
        assert res_a.status_code == 201, f"User A registration failed: {res_a.text}"
        data_a = res_a.json()
        token_a = data_a["access_token"]
        user_a_id = data_a["user"]["id"]
        headers_a = {"Authorization": f"Bearer {token_a}"}
        print(f" -> User A created (ID: {user_a_id}). Token received.")

        # 2. Add confidential data for User A
        print("\n[2] Creating User A tasks, goals, notes, coding, career, and profile details...")
        
        # Task
        task_res = await client.post("/tasks", json={
            "title": "Alice Confidential Blueprint Task",
            "priority": "Critical",
            "category": "Architecture"
        }, headers=headers_a)
        assert task_res.status_code == 201, f"Task creation failed: {task_res.text}"
        task_a_id = task_res.json()["id"]

        # Goal
        goal_res = await client.post("/goals", json={
            "name": "Alice 10M Valuation Target",
            "category": "Career"
        }, headers=headers_a)
        assert goal_res.status_code == 201, f"Goal creation failed: {goal_res.text}"
        goal_a_id = goal_res.json()["id"]

        # Note
        note_res = await client.post("/notes", json={
            "title": "Alice Private Seed Phrase & Notes",
            "content": "Secret credentials and personal notes."
        }, headers=headers_a)
        assert note_res.status_code == 201, f"Note creation failed: {note_res.text}"
        note_a_id = note_res.json()["id"]

        # Coding
        coding_res = await client.post("/coding", json={
            "title": "Alice Solved LRU Cache",
            "difficulty": "Hard"
        }, headers=headers_a)
        assert coding_res.status_code == 201, f"Coding creation failed: {coding_res.text}"
        coding_a_id = coding_res.json()["id"]

        # Career Application
        career_res = await client.post("/career/applications", json={
            "company": "Alice Secret Unicorn",
            "role": "VP Engineering"
        }, headers=headers_a)
        assert career_res.status_code == 201, f"Career creation failed: {career_res.text}"
        career_a_id = career_res.json()["id"]

        # Finance
        finance_res = await client.post("/finance/transactions", json={
            "type": "Income",
            "amount": 25000.0,
            "category": "Salary"
        }, headers=headers_a)
        assert finance_res.status_code == 201, f"Finance creation failed: {finance_res.text}"
        finance_a_id = finance_res.json()["id"]

        # Profile details
        prof_res = await client.patch("/profile/basic", json={
            "full_name": "Alice Confidential",
            "bio": "Principal Security Architect",
            "city": "Geneva",
            "country": "Switzerland"
        }, headers=headers_a)
        assert prof_res.status_code == 200, f"Profile basic failed: {prof_res.text}"

        skill_res = await client.post("/profile/skill", json={
            "name": "Zero-Knowledge Cryptography",
            "proficiency": "Expert",
            "category": "Security"
        }, headers=headers_a)
        assert skill_res.status_code == 200, f"Skill creation failed: {skill_res.text}"
        skill_a_id = skill_res.json()["id"]

        print(f" -> User A records successfully created:")
        print(f"    • Task ID: {task_a_id}")
        print(f"    • Goal ID: {goal_a_id}")
        print(f"    • Note ID: {note_a_id}")
        print(f"    • Coding ID: {coding_a_id}")
        print(f"    • Career ID: {career_a_id}")
        print(f"    • Finance ID: {finance_a_id}")
        print(f"    • Skill ID: {skill_a_id}")

        # 3. Register User B
        email_b = f"bob_{timestamp}@ayora.test"
        pwd_b = "SecretBob@123"
        print(f"\n[3] Registering new User B ({email_b})...")
        res_b = await client.post("/auth/register", json={
            "email": email_b,
            "password": pwd_b,
            "name": "Bob Security"
        })
        assert res_b.status_code == 201, f"User B registration failed: {res_b.text}"
        data_b = res_b.json()
        token_b = data_b["access_token"]
        user_b_id = data_b["user"]["id"]
        headers_b = {"Authorization": f"Bearer {token_b}"}
        print(f" -> User B created (ID: {user_b_id}). Token received.")

        # 4. Verify User B starts with completely empty workspace (0-state)
        print("\n[4] Verifying User B personal workspace is 100% clean and isolated (Zero Data)...")
        b_tasks = (await client.get("/tasks", headers=headers_b)).json()
        b_goals = (await client.get("/goals", headers=headers_b)).json()
        b_notes = (await client.get("/notes", headers=headers_b)).json()
        b_coding = (await client.get("/coding", headers=headers_b)).json()
        b_career = (await client.get("/career/applications", headers=headers_b)).json()
        b_finance = (await client.get("/finance/transactions", headers=headers_b)).json()
        b_analytics = (await client.get("/analytics/summary", headers=headers_b)).json()
        b_profile = (await client.get("/profile", headers=headers_b)).json()
        b_search = (await client.get("/search?q=Alice", headers=headers_b)).json()

        assert len(b_tasks) == 0, f"User B saw tasks: {b_tasks}"
        assert len(b_goals) == 0, f"User B saw goals: {b_goals}"
        assert len(b_notes) == 0, f"User B saw notes: {b_notes}"
        assert len(b_coding) == 0, f"User B saw coding: {b_coding}"
        assert len(b_career) == 0, f"User B saw career apps: {b_career}"
        assert len(b_finance) == 0, f"User B saw transactions: {b_finance}"
        assert b_analytics["stats"]["tasksTotal"] == 0, f"User B saw task count: {b_analytics['stats']}"
        assert b_analytics["stats"]["activeGoals"] == 0
        assert b_analytics["stats"]["codingSolved"] == 0
        assert len(b_profile["skills"]) == 0
        assert b_search["total"] == 0, f"User B search exposed Alice records: {b_search}"
        print(" [PASS] User B has 0 items across all entities. No data leakage in list endpoints or search.")

        # 5. AI Assistant Context Isolation Check
        print("\n[5] Testing AI Assistant context isolation...")
        ai_res = await client.post("/ai/query", json={"query": "Who am I and what are my skills?"}, headers=headers_b)
        ai_data = ai_res.json()
        assert "Zero-Knowledge Cryptography" not in ai_data["reply"], f"AI leaked User A skill to User B: {ai_data}"
        assert "Alice Confidential" not in ai_data["reply"], f"AI leaked User A name to User B: {ai_data}"
        print(" [PASS] AI Copilot has zero context of User A.")

        # 6. IDOR (Insecure Direct Object Reference) Attack Tests
        print("\n[6] Executing IDOR attack simulation: User B attempts to access/mutate User A records...")
        
        # IDOR GET task
        r = await client.get(f"/tasks/{task_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B read User A task! {r.status_code}: {r.text}"
        print(" [PASS] IDOR GET /tasks/{task_a_id} -> 404/403 Rejected")

        # IDOR PATCH task
        r = await client.patch(f"/tasks/{task_a_id}", json={"title": "Hacked by Bob"}, headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B updated User A task! {r.status_code}"
        print(" [PASS] IDOR PATCH /tasks/{task_a_id} -> 404/403 Rejected")

        # IDOR DELETE task
        r = await client.delete(f"/tasks/{task_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B deleted User A task! {r.status_code}"
        print(" [PASS] IDOR DELETE /tasks/{task_a_id} -> 404/403 Rejected")

        # IDOR GET goal
        r = await client.get(f"/goals/{goal_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B read User A goal! {r.status_code}"
        print(" [PASS] IDOR GET /goals/{goal_a_id} -> 404/403 Rejected")

        # IDOR GET note
        r = await client.get(f"/notes/{note_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B read User A note! {r.status_code}"
        print(" [PASS] IDOR GET /notes/{note_a_id} -> 404/403 Rejected")

        # IDOR GET coding
        r = await client.get(f"/coding/{coding_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B read User A coding! {r.status_code}"
        print(" [PASS] IDOR GET /coding/{coding_a_id} -> 404/403 Rejected")

        # IDOR DELETE career application
        r = await client.delete(f"/career/applications/{career_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B deleted User A career app! {r.status_code}"
        print(" [PASS] IDOR DELETE /career/applications/{career_a_id} -> 404/403 Rejected")

        # IDOR DELETE finance transaction
        r = await client.delete(f"/finance/transactions/{finance_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B deleted User A transaction! {r.status_code}"
        print(" [PASS] IDOR DELETE /finance/transactions/{finance_a_id} -> 404/403 Rejected")

        # IDOR DELETE profile skill
        r = await client.delete(f"/profile/skill/{skill_a_id}", headers=headers_b)
        assert r.status_code in (404, 403), f"IDOR Vulnerability: User B deleted User A skill! {r.status_code}"
        print(" [PASS] IDOR DELETE /profile/skill/{skill_a_id} -> 404/403 Rejected")

        # 7. Verify User A data remains intact
        print("\n[7] Verifying User A original data is completely undisturbed...")
        a_task = (await client.get(f"/tasks/{task_a_id}", headers=headers_a)).json()
        assert a_task["title"] == "Alice Confidential Blueprint Task"

        a_goal = (await client.get(f"/goals/{goal_a_id}", headers=headers_a)).json()
        assert a_goal["name"] == "Alice 10M Valuation Target"

        a_note = (await client.get(f"/notes/{note_a_id}", headers=headers_a)).json()
        assert a_note["title"] == "Alice Private Seed Phrase & Notes"

        a_profile = (await client.get("/profile", headers=headers_a)).json()
        assert len(a_profile["skills"]) == 1
        assert a_profile["skills"][0]["name"] == "Zero-Knowledge Cryptography"
        print(" [PASS] User A data is fully intact and undisturbed.")

    print("\n================================================================")
    print("ALL SECURITY AND DATA ISOLATION TESTS PASSED 100%!")
    print("================================================================")

if __name__ == "__main__":
    asyncio.run(run_security_tests())
