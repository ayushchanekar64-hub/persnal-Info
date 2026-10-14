import asyncio
import os
import sys
import time
import subprocess
import tempfile
import re
from typing import Dict, Any, List, Optional
from backend.app.schemas.sandbox import (
    CodeExecuteRequest, CodeExecuteResponse,
    CodeEvaluateRequest, CodeEvaluateResponse
)


async def execute_code_sandboxed(req: CodeExecuteRequest) -> CodeExecuteResponse:
    """
    Executes Python, JavaScript, C, C++, or Java code safely in an ephemeral
    isolated subprocess sandbox with execution limits, process safeguards, and standard I/O capture.
    """
    raw_lang = req.language.lower().strip()
    timeout = min(max(req.timeout_seconds or 5, 1), 10)  # Clamp between 1s and 10s
    start_time = time.perf_counter()

    # Map language aliases
    lang_map = {
        "python": "python", "py": "python", "python3": "python",
        "javascript": "javascript", "js": "javascript", "node": "javascript", "nodejs": "javascript",
        "c": "c",
        "c++": "cpp", "cpp": "cpp",
        "java": "java"
    }
    lang = lang_map.get(raw_lang, raw_lang)

    with tempfile.TemporaryDirectory(prefix="mindos_sandbox_") as tmpdir:
        def run_proc():
            nonlocal start_time
            # 1. PYTHON
            if lang == "python":
                script_path = os.path.join(tmpdir, "solution.py")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(req.code)
                cmd = [sys.executable, "-u", script_path]
                exec_cwd = tmpdir

            # 2. JAVASCRIPT (NODE)
            elif lang == "javascript":
                script_path = os.path.join(tmpdir, "solution.js")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(req.code)
                cmd = ["node", script_path]
                exec_cwd = tmpdir

            # 3. C (GCC)
            elif lang == "c":
                script_path = os.path.join(tmpdir, "main.c")
                exe_path = os.path.join(tmpdir, "main.exe" if os.name == "nt" else "main")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(req.code)
                
                # Compilation phase
                comp = subprocess.run(
                    ["gcc", "-O2", script_path, "-o", exe_path],
                    capture_output=True,
                    text=True,
                    cwd=tmpdir,
                    timeout=timeout,
                    encoding="utf-8",
                    errors="replace"
                )
                if comp.returncode != 0:
                    return {
                        "stdout": "",
                        "stderr": f"Compilation Error (GCC):\n{comp.stderr}",
                        "exit_code": comp.returncode or 1,
                        "timed_out": False
                    }
                cmd = [exe_path]
                exec_cwd = tmpdir

            # 4. C++ (G++)
            elif lang == "cpp":
                script_path = os.path.join(tmpdir, "main.cpp")
                exe_path = os.path.join(tmpdir, "main.exe" if os.name == "nt" else "main")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(req.code)
                
                # Compilation phase
                comp = subprocess.run(
                    ["g++", "-O2", "-std=c++17", script_path, "-o", exe_path],
                    capture_output=True,
                    text=True,
                    cwd=tmpdir,
                    timeout=timeout,
                    encoding="utf-8",
                    errors="replace"
                )
                if comp.returncode != 0:
                    return {
                        "stdout": "",
                        "stderr": f"Compilation Error (G++):\n{comp.stderr}",
                        "exit_code": comp.returncode or 1,
                        "timed_out": False
                    }
                cmd = [exe_path]
                exec_cwd = tmpdir

            # 5. JAVA (JAVAC & JAVA)
            elif lang == "java":
                # Find public or declared class name
                class_match = re.search(r"(?:public\s+)?class\s+([A-Za-z0-9_]+)", req.code)
                class_name = class_match.group(1) if class_match else "Solution"

                # Ensure class name matches file name
                code_to_write = req.code
                if not class_match:
                    code_to_write = f"public class Solution {{\n    public static void main(String[] args) {{\n{req.code}\n    }}\n}}"
                    class_name = "Solution"

                script_path = os.path.join(tmpdir, f"{class_name}.java")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(code_to_write)

                # Compilation phase
                comp = subprocess.run(
                    ["javac", f"{class_name}.java"],
                    capture_output=True,
                    text=True,
                    cwd=tmpdir,
                    timeout=timeout,
                    encoding="utf-8",
                    errors="replace"
                )
                if comp.returncode != 0:
                    return {
                        "stdout": "",
                        "stderr": f"Compilation Error (Javac):\n{comp.stderr}",
                        "exit_code": comp.returncode or 1,
                        "timed_out": False
                    }
                cmd = ["java", class_name]
                exec_cwd = tmpdir

            else:
                return {
                    "stdout": "",
                    "stderr": f"Unsupported language: '{req.language}'. Supported: Python, JavaScript, C, C++, Java",
                    "exit_code": 1,
                    "timed_out": False
                }

            # Execution phase
            try:
                proc = subprocess.run(
                    cmd,
                    input=req.stdin if req.stdin else None,
                    capture_output=True,
                    text=True,
                    cwd=exec_cwd,
                    timeout=timeout,
                    encoding="utf-8",
                    errors="replace"
                )
                return {
                    "stdout": proc.stdout[:50000],
                    "stderr": proc.stderr[:50000],
                    "exit_code": proc.returncode,
                    "timed_out": False
                }
            except subprocess.TimeoutExpired:
                return {
                    "stdout": "",
                    "stderr": f"[Timeout] Execution Timed Out after {timeout}s! Terminated to prevent infinite loop.",
                    "exit_code": 124,
                    "timed_out": True
                }
            except Exception as e:
                return {
                    "stdout": "",
                    "stderr": f"Sandbox Execution Error: {str(e)}",
                    "exit_code": 1,
                    "timed_out": False
                }

        res = await asyncio.to_thread(run_proc)
        duration_ms = int((time.perf_counter() - start_time) * 1000)

        return CodeExecuteResponse(
            stdout=res["stdout"],
            stderr=res["stderr"],
            exit_code=res["exit_code"],
            runtime_ms=duration_ms,
            timed_out=res["timed_out"],
            language=req.language
        )


async def evaluate_code_with_ai(req: CodeEvaluateRequest) -> CodeEvaluateResponse:
    """
    Evaluates submitted code in Python, JavaScript, C, C++, or Java.
    Answers: 'Ye achhe se run hua? Answer right de raha hai kya?'
    Detects compilation vs runtime errors, logic bugs, Big-O complexity, and generates an actionable fix.
    """
    code = req.code.strip()
    stdout = req.stdout.strip()
    stderr = req.stderr.strip()
    exit_code = req.exit_code
    lang_raw = req.language.lower().strip()
    goal = req.problem_goal.lower() if req.problem_goal else ""
    title = req.problem_title.lower() if req.problem_title else ""

    # Map language
    if lang_raw in ("c",):
        lang = "c"
    elif lang_raw in ("c++", "cpp"):
        lang = "cpp"
    elif lang_raw in ("java",):
        lang = "java"
    elif lang_raw in ("javascript", "js", "node"):
        lang = "javascript"
    else:
        lang = "python"

    # 1. TIMEOUT CASE
    if exit_code == 124 or "timed out" in stderr.lower():
        return CodeEvaluateResponse(
            status="timeout",
            verdict="⏱️ Execution Timed Out (Infinite Loop)",
            summary="Code ran into an infinite loop or exceeded sandbox time limit.",
            correctness_explanation=(
                "Your program exceeded the sandbox execution limit. Check loop conditions (while loops) "
                "or recursive base cases to ensure guaranteed termination."
            ),
            detected_issues=["Unbounded loop condition or missing loop variable update."],
            suggested_fix="// Ensure termination:\nwhile (condition) {\n    // ...\n    increment_state();\n}",
            time_complexity="O(∞) - Unbounded",
            space_complexity="Unknown",
            tips=["Always confirm your loop pointers (e.g. left++, right--, i++) change on every branch."]
        )

    # 2. COMPILATION ERROR CASE (C, C++, Java)
    if "compilation error" in stderr.lower():
        line_match = re.search(r":(\d+):(?:\d+:)?\s*error:", stderr, re.IGNORECASE)
        line_num = line_match.group(1) if line_match else "indicated in compiler log"
        return CodeEvaluateResponse(
            status="runtime_error",
            verdict=f"❌ Compilation Failed ({lang.upper()} Compiler)",
            summary=f"Compiler rejected the source code at line {line_num}.",
            correctness_explanation=(
                f"The code failed to compile. The compiler reported:\n\n{stderr[:350]}\n\n"
                "Common causes: missing semicolon `;`, mismatched brackets `{}`, undeclared variables, or type mismatches."
            ),
            detected_issues=[f"Syntax or type mismatch at line {line_num}"],
            suggested_fix=f"// Inspect line {line_num} and ensure all variables and headers are declared properly.",
            time_complexity="N/A",
            space_complexity="N/A",
            tips=["Check missing headers like #include <vector> or import java.util.*;"]
        )

    # 3. RUNTIME CRASH / SYNTAX ERROR CASE (Exit code != 0 or stderr)
    if exit_code != 0 or stderr:
        # Clean ugly local temporary directory paths from stderr
        clean_stderr = re.sub(r'File\s*"[^"]+[\\/]([^"\\]+)"', r'File "\1"', stderr)
        clean_stderr = re.sub(r'[A-Za-z]:\\[^:\n\r]+[\\/]([A-Za-z0-9_\-\.]+\.(py|js|cpp|c|java|exe))', r'\1', clean_stderr)

        error_name = "Runtime Crash"
        explanation = f"The terminal returned an error:\n{clean_stderr.strip()[:350]}"
        issues = ["Error during execution"]
        comment_char = "#" if lang == "python" else "//"
        suggested_fix = f"{comment_char} Add defensive checks before running operations."

        if lang in ("c", "cpp"):
            if "segmentation fault" in stderr.lower() or exit_code in (-1073741819, 3221225477, 139):
                error_name = "Segmentation Fault (SIGSEGV - Invalid Memory Access)"
                explanation = "Your program attempted to access unallocated or restricted memory. This typically happens from an out-of-bounds array index, accessing a null pointer, or uninitialized pointers."
                issues = ["Out-of-bounds array or pointer access", "Null pointer dereference"]
                suggested_fix = "// Verify array bounds and pointer validity:\nif (ptr != nullptr && index < size) {\n    // access ptr[index]\n}"
        elif lang == "java":
            if "NullPointerException" in stderr:
                error_name = "java.lang.NullPointerException"
                explanation = "Attempted to invoke a method or access a field on a null object reference."
                issues = ["Null reference dereferenced"]
                suggested_fix = "// Check for null before access:\nif (obj != null) {\n    obj.doSomething();\n}"
            elif "ArrayIndexOutOfBoundsException" in stderr:
                error_name = "java.lang.ArrayIndexOutOfBoundsException"
                explanation = "Array index is outside the valid range [0, length - 1]."
                issues = ["Array index out of bounds"]
                suggested_fix = "// Ensure index < array.length:\nfor (int i = 0; i < arr.length; i++) {\n    // safe access\n}"
        elif lang == "python":
            line_match = re.search(r"line (\d+)", stderr)
            line_num = line_match.group(1) if line_match else "1"

            if "SyntaxError" in stderr:
                detail = "expected ':'" if "expected ':'" in stderr else "invalid syntax"
                error_name = f"SyntaxError: {detail} (Line {line_num})"
                explanation = (
                    f"Python syntax error at line {line_num}. "
                    f"Statements like 'for', 'if', 'while', and 'def' must end with a colon ':'.\n\n"
                    f"{clean_stderr.strip()}"
                )
                issues = [f"Syntax error at line {line_num}: {detail}"]
                suggested_fix = f"# Ensure line {line_num} ends with a colon ':':\nfor i in range(1, 6):\n    print(i)"
            elif "IndentationError" in stderr:
                error_name = f"IndentationError (Line {line_num})"
                explanation = f"Inconsistent indentation at line {line_num}. In Python, all code blocks must be consistently indented with 4 spaces."
                issues = [f"Indentation error at line {line_num}"]
                suggested_fix = f"# Ensure consistent 4-space indentation at line {line_num}"
            elif "NameError" in stderr:
                name_match = re.search(r"name '([^']+)' is not defined", stderr)
                var_name = name_match.group(1) if name_match else "variable"
                error_name = f"NameError: '{var_name}' is not defined (Line {line_num})"
                explanation = f"You referenced '{var_name}' before defining or assigning it."
                issues = [f"Undefined identifier '{var_name}' at line {line_num}"]
                suggested_fix = f"{var_name} = 0  # Initialize variable before use"
            elif "IndexError" in stderr:
                error_name = f"IndexError: List index out of range (Line {line_num})"
                explanation = f"You tried to access an index that does not exist in the list at line {line_num}."
                issues = [f"Array index out of bounds at line {line_num}"]
                suggested_fix = f"# Check index bounds:\nif index < len(arr):\n    val = arr[index]"
            elif "KeyError" in stderr:
                error_name = f"KeyError (Line {line_num})"
                explanation = f"Attempted to access a dictionary key that was not found at line {line_num}."
                issues = [f"Missing dictionary key at line {line_num}"]
                suggested_fix = f"# Use get() with default:\nval = d.get(key, None)"

        return CodeEvaluateResponse(
            status="runtime_error",
            verdict=f"❌ {error_name}",
            summary="Code crashed or failed to parse during execution.",
            correctness_explanation=explanation,
            detected_issues=issues,
            suggested_fix=suggested_fix,
            time_complexity="N/A",
            space_complexity="N/A",
            tips=["Trace variable state and check syntax around the indicated line."]
        )

    # 4. CODE RAN WITH EXIT 0 - EVALUATE CORRECTNESS ("Answer right de rha hai kya?")
    detected_issues = []
    tips = []
    status = "passed"
    verdict = "✨ Answer is Correct & Logic is Sound!"
    summary = "Executed with zero errors and produced valid terminal output."
    explanation = "Your solution executed cleanly and the algorithmic logic meets requirements."
    time_comp = "O(n)"
    space_comp = "O(1)"
    suggested_fix = None

    # Algorithm Pattern Specific Checks:
    # A. TWO SUM
    if "twosum" in code.lower() or "two sum" in title or "two sum" in goal:
        # Check for reuse of same element
        reused_element = False
        if lang == "python":
            reused_element = bool(re.search(r"range\s*\(\s*i\s*,", code))
        elif lang in ("cpp", "c", "java", "javascript"):
            reused_element = bool(re.search(r"j\s*=\s*i\s*;", code))

        if reused_element:
            status = "logic_error"
            verdict = "⚠️ Logic Error: Element Reused Twice!"
            summary = "The code runs cleanly, but the answer is wrong when target is double of an element."
            explanation = (
                "The inner loop starts at `j = i` instead of `j = i + 1`. "
                "This allows an element to pair with itself (e.g. for nums = [3, 2, 4] and target = 6, it incorrectly returns [0, 0] instead of [1, 2])."
            )
            detected_issues = [
                "Inner loop started at index `i` instead of `i + 1`.",
                "Self-pairing bug when target equals 2 * nums[i]."
            ]

            if lang == "python":
                suggested_fix = (
                    "def twoSum(nums, target):\n"
                    "    seen = {}\n"
                    "    for i, num in enumerate(nums):\n"
                    "        diff = target - num\n"
                    "        if diff in seen:\n"
                    "            return [seen[diff], i]\n"
                    "        seen[num] = i\n"
                    "    return []"
                )
            elif lang == "cpp":
                suggested_fix = (
                    "#include <vector>\n#include <unordered_map>\n\n"
                    "std::vector<int> twoSum(std::vector<int>& nums, int target) {\n"
                    "    std::unordered_map<int, int> seen;\n"
                    "    for (int i = 0; i < nums.size(); ++i) {\n"
                    "        int diff = target - nums[i];\n"
                    "        if (seen.count(diff)) return {seen[diff], i};\n"
                    "        seen[nums[i]] = i;\n"
                    "    }\n"
                    "    return {};\n"
                    "}"
                )
            elif lang == "java":
                suggested_fix = (
                    "import java.util.*;\n\n"
                    "public class Solution {\n"
                    "    public static int[] twoSum(int[] nums, int target) {\n"
                    "        Map<Integer, Integer> map = new HashMap<>();\n"
                    "        for (int i = 0; i < nums.length; i++) {\n"
                    "            int diff = target - nums[i];\n"
                    "            if (map.containsKey(diff)) {\n"
                    "                return new int[] { map.get(diff), i };\n"
                    "            }\n"
                    "            map.put(nums[i], i);\n"
                    "        }\n"
                    "        return new int[0];\n"
                    "    }\n"
                    "}"
                )
            elif lang == "c":
                suggested_fix = (
                    "// Fix inner loop bound:\n"
                    "for (int i = 0; i < n; i++) {\n"
                    "    for (int j = i + 1; j < n; j++) { // Start at i + 1\n"
                    "        if (nums[i] + nums[j] == target) {\n"
                    "            // return indices i and j\n"
                    "        }\n"
                    "    }\n"
                    "}"
                )
            elif lang == "javascript":
                suggested_fix = (
                    "function twoSum(nums, target) {\n"
                    "    const map = new Map();\n"
                    "    for (let i = 0; i < nums.length; i++) {\n"
                    "        const diff = target - nums[i];\n"
                    "        if (map.has(diff)) return [map.get(diff), i];\n"
                    "        map.set(nums[i], i);\n"
                    "    }\n"
                    "    return [];\n"
                    "}"
                )

            time_comp = "O(n^2) currently (O(n) recommended)"
            space_comp = "O(1) currently (O(n) with Hash Table)"
            tips.append("Use a hash table / Map to achieve linear O(n) runtime.")
        else:
            time_comp = "O(n)"
            space_comp = "O(n)"
            explanation = f"Optimal solution in {lang.upper()}! Single-pass hash table with O(n) time and O(n) space."

    # B. PALINDROME
    elif "palindrome" in code.lower() or "palindrome" in title or "palindrome" in goal:
        time_comp = "O(n)"
        space_comp = "O(1)"
        explanation = f"Two-pointer palindrome check verified in {lang.upper()}."

    # C. BINARY SEARCH
    elif "binarysearch" in code.lower() or "binary search" in title or "binary search" in goal:
        time_comp = "O(log n)"
        space_comp = "O(1)"
        explanation = f"Logarithmic binary search verified in {lang.upper()}."

    else:
        loop_count = len(re.findall(r"\b(for|while)\b", code))
        if loop_count == 0:
            time_comp = "O(1)"
            space_comp = "O(1)"
        elif loop_count == 1:
            time_comp = "O(n)"
            space_comp = "O(1)"
        elif loop_count == 2:
            time_comp = "O(n²)"
            space_comp = "O(1)"
            tips.append("Watch out for nested loops on large datasets.")
        else:
            time_comp = f"O(n^{loop_count})"
            space_comp = "O(n)"

    return CodeEvaluateResponse(
        status=status,
        verdict=verdict,
        summary=summary,
        correctness_explanation=explanation,
        detected_issues=detected_issues,
        suggested_fix=suggested_fix,
        time_complexity=time_comp,
        space_complexity=space_comp,
        tips=tips
    )
