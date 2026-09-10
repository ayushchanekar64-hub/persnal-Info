import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import init_db


@pytest.fixture(scope="session", autouse=True)
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    await init_db()


import uuid

@pytest.mark.asyncio
async def test_multi_user_data_isolation():
    transport = ASGITransport(app=app)
    uid = uuid.uuid4().hex[:8]
    email_a = f"alice_{uid}@mynexus.io"
    email_b = f"bob_{uid}@mynexus.io"

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register User A
        res_a = await client.post(
            "/api/v1/auth/register",
            json={
                "email": email_a,
                "password": "SecurePassword123!",
                "name": "Alice Developer",
            },
        )
        assert res_a.status_code == 201, res_a.text
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register User B
        res_b = await client.post(
            "/api/v1/auth/register",
            json={
                "email": email_b,
                "password": "SecurePassword123!",
                "name": "Bob Analyst",
            },
        )
        assert res_b.status_code == 201, res_b.text
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. User A creates private records across modules
        # Task
        task_res = await client.post(
            "/api/v1/tasks",
            headers=headers_a,
            json={
                "title": "Alice Confidential System Architecture Task",
                "category": "Architecture",
                "priority": "Critical",
            },
        )
        assert task_res.status_code == 201, task_res.text
        task_a_id = task_res.json()["id"]

        # Goal
        goal_res = await client.post(
            "/api/v1/goals",
            headers=headers_a,
            json={"name": "Alice Private Master Plan", "category": "Product", "progress": 50},
        )
        assert goal_res.status_code == 201
        goal_a_id = goal_res.json()["id"]

        # Note
        note_res = await client.post(
            "/api/v1/notes",
            headers=headers_a,
            json={"title": "Alice Private Journal", "content": "Classified secret thoughts"},
        )
        assert note_res.status_code == 201

        # Habit
        habit_res = await client.post(
            "/api/v1/habits",
            headers=headers_a,
            json={"name": "Alice Morning Deep Work", "frequency": "Daily"},
        )
        assert habit_res.status_code == 201

        # Learning
        learn_res = await client.post(
            "/api/v1/learning",
            headers=headers_a,
            json={"skill": "Alice Quantum Computing Study", "hours": 5.0},
        )
        assert learn_res.status_code == 201

        # Coding
        code_res = await client.post(
            "/api/v1/coding",
            headers=headers_a,
            json={"title": "Alice Hard Algorithm Challenge", "difficulty": "Hard"},
        )
        assert code_res.status_code == 201

        # Finance
        finance_res = await client.post(
            "/api/v1/finance/transactions",
            headers=headers_a,
            json={"type": "Income", "amount": 10000.0, "category": "Salary", "date": "2026-09-10"},
        )
        assert finance_res.status_code == 201

        # Career
        career_res = await client.post(
            "/api/v1/career/applications",
            headers=headers_a,
            json={"company": "Alice Dream Tech Corp", "role": "Principal Architect"},
        )
        assert career_res.status_code == 201

        # 4. Verify User B has ZERO access to User A's data
        # Tasks list for User B
        b_tasks = await client.get("/api/v1/tasks", headers=headers_b)
        assert b_tasks.status_code == 200
        assert len(b_tasks.json()) == 0, f"User B saw tasks: {b_tasks.json()}"

        # Goals list for User B
        b_goals = await client.get("/api/v1/goals", headers=headers_b)
        assert b_goals.status_code == 200
        assert len(b_goals.json()) == 0

        # Notes list for User B
        b_notes = await client.get("/api/v1/notes", headers=headers_b)
        assert b_notes.status_code == 200
        assert len(b_notes.json()) == 0

        # Habits list for User B
        b_habits = await client.get("/api/v1/habits", headers=headers_b)
        assert b_habits.status_code == 200
        assert len(b_habits.json()) == 0

        # Learning list for User B
        b_learning = await client.get("/api/v1/learning", headers=headers_b)
        assert b_learning.status_code == 200
        assert len(b_learning.json()) == 0

        # Coding list for User B
        b_coding = await client.get("/api/v1/coding", headers=headers_b)
        assert b_coding.status_code == 200
        assert len(b_coding.json()) == 0

        # Finance transactions for User B
        b_finance = await client.get("/api/v1/finance/transactions", headers=headers_b)
        assert b_finance.status_code == 200
        assert len(b_finance.json()) == 0

        # Career applications for User B
        b_career = await client.get("/api/v1/career/applications", headers=headers_b)
        assert b_career.status_code == 200
        assert len(b_career.json()) == 0

        # Analytics summary for User B must be all 0s
        b_analytics = await client.get("/api/v1/analytics/summary", headers=headers_b)
        assert b_analytics.status_code == 200
        b_stats = b_analytics.json()["stats"]
        assert b_stats["tasksTotal"] == 0
        assert b_stats["activeGoals"] == 0
        assert b_stats["learningHours"] == 0.0
        assert b_stats["codingSolved"] == 0
        assert b_analytics.json()["monthlyIncome"] == 0.0

        # 5. Direct Resource-ID Manipulation Attack
        # User B attempts to GET User A's task by ID
        hack_get = await client.get(f"/api/v1/tasks/{task_a_id}", headers=headers_b)
        assert hack_get.status_code == 404, f"ID manipulation succeeded: {hack_get.status_code}"

        # User B attempts to UPDATE User A's task by ID
        hack_patch = await client.patch(
            f"/api/v1/tasks/{task_a_id}",
            headers=headers_b,
            json={"title": "Hacked by User B"},
        )
        assert hack_patch.status_code == 404

        # User B attempts to DELETE User A's task by ID
        hack_delete = await client.delete(f"/api/v1/tasks/{task_a_id}", headers=headers_b)
        assert hack_delete.status_code == 404

        # User B attempts to GET User A's goal by ID
        hack_goal = await client.get(f"/api/v1/goals/{goal_a_id}", headers=headers_b)
        assert hack_goal.status_code == 404

        # 6. Global Search Isolation
        search_b = await client.get("/api/v1/search?q=Alice", headers=headers_b)
        assert search_b.status_code == 200
        assert search_b.json()["total"] == 0, "User B search leaked User A's records!"

        # Global search for User A finds records
        search_a = await client.get("/api/v1/search?q=Alice", headers=headers_a)
        assert search_a.status_code == 200
        assert search_a.json()["total"] > 0


@pytest.mark.asyncio
async def test_create_forms_all_fields():
    transport = ASGITransport(app=app)
    uid = uuid.uuid4().hex[:8]
    email = f"developer_{uid}@mynexus.io"

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": "SecurePassword123!", "name": "Form Tester"},
        )
        assert reg_res.status_code == 201
        headers = {"Authorization": f"Bearer {reg_res.json()['access_token']}"}

        # 1. TEST GOAL CREATE (all fields & validations)
        goal_payload = {
            "name": "Become Principal Engineer",
            "description": "Master distributed consensus and lead architecture",
            "category": "Career",
            "priority": "Critical",
            "start_date": "2026-09-01",
            "target_date": "2026-12-31",
            "progress": 25,
            "status": "In Progress"
        }
        g_res = await client.post("/api/v1/goals", headers=headers, json=goal_payload)
        assert g_res.status_code == 201, g_res.text
        goal_data = g_res.json()
        assert goal_data["name"] == goal_payload["name"]
        assert goal_data["description"] == goal_payload["description"]
        assert goal_data["priority"] == "Critical"
        assert goal_data["progress"] == 25
        assert goal_data["target_date"] == "2026-12-31"
        goal_id = goal_data["id"]

        # Test Goal Validation: Invalid progress (>100)
        invalid_g = await client.post(
            "/api/v1/goals",
            headers=headers,
            json={"name": "Bad Goal", "progress": 150}
        )
        assert invalid_g.status_code == 422

        # Test Goal Validation: Target date before start date
        invalid_dates_g = await client.post(
            "/api/v1/goals",
            headers=headers,
            json={"name": "Time Travel Goal", "start_date": "2026-10-01", "target_date": "2026-09-01"}
        )
        assert invalid_dates_g.status_code == 422

        # 2. TEST TASK CREATE (all fields & linked goal validation)
        task_payload = {
            "title": "Build Distributed Consensus Engine",
            "description": "Implement Raft protocol with log compaction",
            "category": "Engineering",
            "priority": "Critical",
            "status": "In Progress",
            "due_date": "2026-09-15",
            "due_time": "17:00",
            "estimated_time": "3h 30m",
            "goal_id": goal_id,
            "tags": "raft, consensus, distributed-systems"
        }
        t_res = await client.post("/api/v1/tasks", headers=headers, json=task_payload)
        assert t_res.status_code == 201, t_res.text
        task_data = t_res.json()
        assert task_data["title"] == task_payload["title"]
        assert task_data["description"] == task_payload["description"]
        assert task_data["priority"] == "Critical"
        assert task_data["status"] == "In Progress"
        assert task_data["due_date"] == "2026-09-15"
        assert task_data["due_time"] == "17:00"
        assert task_data["estimated_time"] == "3h 30m"
        assert task_data["goal_id"] == goal_id
        assert task_data["goal_title"] == "Become Principal Engineer"

        # Test Task Linked Goal Validation: arbitrary goal_id belonging to no one or another user
        fake_goal_task = await client.post(
            "/api/v1/tasks",
            headers=headers,
            json={"title": "Hacked Task", "goal_id": "00000000-0000-0000-0000-000000000000"}
        )
        assert fake_goal_task.status_code == 400

        # 3. TEST LEARNING SESSION CREATE (all fields & session auto-logging)
        learning_payload = {
            "skill": "Python",
            "topic": "Decorators & Metaprogramming",
            "course": "Advanced Python Deep Dive",
            "category": "Technical",
            "learning_date": "2026-09-10",
            "duration": "1h 30m",
            "status": "Completed",
            "progress": 100,
            "notes": "Learned function decorators, class decorators, and practical wrap use cases."
        }
        l_res = await client.post("/api/v1/learning", headers=headers, json=learning_payload)
        assert l_res.status_code == 201, l_res.text
        learning_data = l_res.json()
        assert learning_data["skill"] == "Python"
        assert learning_data["topic"] == "Decorators & Metaprogramming"
        assert learning_data["course"] == "Advanced Python Deep Dive"
        assert learning_data["duration"] == "1h 30m"
        assert learning_data["progress"] == 100
        assert learning_data["status"] == "Completed"
        assert learning_data["notes"] == learning_payload["notes"]
        assert len(learning_data["sessions"]) == 1
        assert learning_data["sessions"][0]["hours"] == 1.5

        # 4. TEST CODING PROBLEM CREATE (all fields & mistake log)
        coding_payload = {
            "title": "Longest Increasing Subsequence",
            "platform": "LeetCode",
            "problem_url": "https://leetcode.com/problems/longest-increasing-subsequence/",
            "topic": "Dynamic Programming & Binary Search",
            "difficulty": "Medium",
            "status": "Solved",
            "programming_language": "Python",
            "time_taken": "25m",
            "attempts": 2,
            "solution_notes": "Used patient sorting with bisect_left for O(N log N) runtime.",
            "mistake_learning": "Initially used O(N^2) DP. Remember patience sorting algorithm with tails array."
        }
        c_res = await client.post("/api/v1/coding", headers=headers, json=coding_payload)
        assert c_res.status_code == 201, c_res.text
        coding_data = c_res.json()
        assert coding_data["title"] == coding_payload["title"]
        assert coding_data["platform"] == "LeetCode"
        assert coding_data["difficulty"] == "Medium"
        assert coding_data["status"] == "Solved"
        assert coding_data["programming_language"] == "Python"
        assert coding_data["time_taken"] == "25m"
        assert coding_data["attempts"] == 2
        assert coding_data["solution_notes"] == coding_payload["solution_notes"]
        assert coding_data["mistake_learning"] == coding_payload["mistake_learning"]

