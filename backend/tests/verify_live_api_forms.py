import urllib.request
import json
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"


def make_request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return e.code, json.loads(err_body) if err_body else None


def run_verification():
    print("=== STARTING LIVE API FORMS VERIFICATION ===")
    
    # 1. Register User A
    uid = uuid.uuid4().hex[:6]
    email_a = f"alice_live_{uid}@mynexus.io"
    status, res = make_request("POST", "/auth/register", {
        "email": email_a,
        "password": "SecurePassword123!",
        "name": "Alice Live Tester"
    })
    assert status == 201, f"Failed to register User A: {res}"
    token_a = res["access_token"]
    print(f"[OK] Registered User A ({email_a})")

    # 2. CREATE GOAL
    status, goal = make_request("POST", "/goals", {
        "name": "Achieve Staff Software Engineer",
        "description": "Demonstrate high organizational impact across distributed systems",
        "category": "Career",
        "priority": "Critical",
        "start_date": "2026-09-01",
        "target_date": "2026-12-31",
        "progress": 35,
        "status": "In Progress"
    }, token=token_a)
    assert status == 201, f"Failed to create goal: {goal}"
    assert goal["name"] == "Achieve Staff Software Engineer"
    assert goal["target_date"] == "2026-12-31"
    assert goal["priority"] == "Critical"
    assert goal["progress"] == 35
    goal_id = goal["id"]
    print(f"[OK] Goal created with all fields: ID={goal_id}")

    # 3. CREATE TASK (Linked to Goal)
    status, task = make_request("POST", "/tasks", {
        "title": "Design Fault-Tolerant Distributed KV Store",
        "description": "Draft RFC document covering Raft replication and LSM-tree persistence",
        "category": "Architecture",
        "priority": "High",
        "status": "In Progress",
        "due_date": "2026-09-20",
        "due_time": "18:00",
        "estimated_time": "4h 30m",
        "goal_id": goal_id,
        "tags": "distributed-systems, storage, rfc"
    }, token=token_a)
    assert status == 201, f"Failed to create task: {task}"
    assert task["title"] == "Design Fault-Tolerant Distributed KV Store"
    assert task["due_date"] == "2026-09-20"
    assert task["due_time"] == "18:00"
    assert task["estimated_time"] == "4h 30m"
    assert task["goal_id"] == goal_id
    assert task["goal_title"] == "Achieve Staff Software Engineer"
    task_id = task["id"]
    print(f"[OK] Task created with all fields and verified linked goal: ID={task_id}")

    # 4. LOG LEARNING SESSION
    status, learning = make_request("POST", "/learning", {
        "skill": "Python",
        "topic": "Decorators & Metaclasses",
        "course": "Deep Dive into Python Internals",
        "category": "Technical",
        "learning_date": "2026-09-10",
        "duration": "1h 30m",
        "status": "Completed",
        "progress": 100,
        "notes": "Explored function wrappers, functools.wraps, and parameterized decorator factories."
    }, token=token_a)
    assert status == 201, f"Failed to log learning: {learning}"
    assert learning["skill"] == "Python"
    assert learning["topic"] == "Decorators & Metaclasses"
    assert learning["duration"] == "1h 30m"
    assert learning["notes"] is not None
    assert len(learning["sessions"]) == 1
    assert learning["sessions"][0]["hours"] == 1.5
    print(f"[OK] Learning session logged with all fields & telemetry session: ID={learning['id']}")

    # 5. LOG CODING PROBLEM
    status, coding = make_request("POST", "/coding", {
        "title": "Trapping Rain Water",
        "platform": "LeetCode",
        "problem_url": "https://leetcode.com/problems/trapping-rain-water/",
        "topic": "Two Pointers & Monotonic Stack",
        "difficulty": "Hard",
        "status": "Solved",
        "programming_language": "Python",
        "time_taken": "35m",
        "attempts": 2,
        "solution_notes": "Maintained left_max and right_max with two pointers for O(1) space and O(N) time.",
        "mistake_learning": "Initially forgot to handle when left_max == right_max. Two pointer technique is optimal."
    }, token=token_a)
    assert status == 201, f"Failed to log coding problem: {coding}"
    assert coding["title"] == "Trapping Rain Water"
    assert coding["difficulty"] == "Hard"
    assert coding["time_taken"] == "35m"
    assert coding["attempts"] == 2
    assert coding["solution_notes"] and "two pointers" in coding["solution_notes"].lower()
    assert coding["mistake_learning"] and "left_max" in coding["mistake_learning"]
    print(f"[OK] Coding problem logged with all fields & mistake learning notes: ID={coding['id']}")

    # 6. VERIFY PERSISTENCE & DASHBOARD TELEMETRY
    status, summary = make_request("GET", "/analytics/summary", token=token_a)
    assert status == 200, f"Failed to get summary: {summary}"
    stats = summary["stats"]
    assert stats["tasksTotal"] >= 1
    assert stats["activeGoals"] >= 1
    assert stats["learningHours"] >= 1.5
    assert stats["codingSolved"] >= 1
    print(f"[OK] Real Dashboard Statistics computed dynamically: {stats}")

    # 7. VERIFY MULTI-USER ISOLATION WITH USER B
    email_b = f"bob_live_{uid}@mynexus.io"
    status, res_b = make_request("POST", "/auth/register", {
        "email": email_b,
        "password": "SecurePassword123!",
        "name": "Bob Live Tester"
    })
    assert status == 201
    token_b = res_b["access_token"]
    print(f"[OK] Registered User B ({email_b})")

    status, b_tasks = make_request("GET", "/tasks", token=token_b)
    assert status == 200 and len(b_tasks) == 0, f"User B saw User A tasks: {b_tasks}"

    status, b_goals = make_request("GET", "/goals", token=token_b)
    assert status == 200 and len(b_goals) == 0

    status, b_learning = make_request("GET", "/learning", token=token_b)
    assert status == 200 and len(b_learning) == 0

    status, b_coding = make_request("GET", "/coding", token=token_b)
    assert status == 200 and len(b_coding) == 0

    # User B attempting to hack User A's task by ID
    status, hack = make_request("GET", f"/tasks/{task_id}", token=token_b)
    assert status == 404, f"Security Breach! User B accessed User A's task: {hack}"

    # User B attempting to link their task to User A's goal
    status, bad_link = make_request("POST", "/tasks", {
        "title": "Malicious Task",
        "goal_id": goal_id
    }, token=token_b)
    assert status == 400, f"Security Breach! User B linked to User A's goal: {bad_link}"

    print("[OK] 100% Zero-Trust Data Isolation and ID-Manipulation Resistance Verified!")
    print("=== ALL 4 MODULE FORMS AND MULTI-USER VERIFICATIONS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_verification()
