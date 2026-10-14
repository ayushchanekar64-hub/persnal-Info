import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Sparkles,
  Terminal,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  Save,
  Code2,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/coding-studio.css';

const LANGUAGE_TEMPLATES = {
  python: `# Python 3 Solution
def solve():
    print("Hello from Python Sandbox!")

if __name__ == '__main__':
    solve()
`,
  cpp: `// C++17 Solution (G++ 14)
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello from C++ Sandbox!" << endl;
    return 0;
}
`,
  c: `// C Solution (GCC 14)
#include <stdio.h>

int main() {
    printf("Hello from C Sandbox!\\n");
    return 0;
}
`,
  java: `// Java Solution (Adoptium JDK 11)
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello from Java Sandbox!");
    }
}
`,
  javascript: `// JavaScript Solution (Node.js)
function solve() {
    console.log("Hello from JavaScript Sandbox!");
}

solve();
`
};

const PRESET_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    goal: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may not use the same element twice.',
    codeByLang: {
      python: `def twoSum(nums, target):
    # Try solving this! Watch out: do not reuse the same element twice.
    for i in range(len(nums)):
        for j in range(i, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Test execution:
nums = [3, 2, 4]
target = 6
result = twoSum(nums, target)
print("Input:", nums, "Target:", target)
print("Output:", result)
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Watch out: inner loop starting at 'i' reuses the same element!
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i; j < nums.size(); j++) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}

int main() {
    vector<int> nums = {3, 2, 4};
    vector<int> res = twoSum(nums, 6);
    cout << "Output: [" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}
`,
      java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Watch out: starting at j = i allows using the same number twice!
        for (int i = 0; i < nums.length; i++) {
            for (int j = i; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] nums = { 3, 2, 4 };
        int[] res = twoSum(nums, 6);
        System.out.println("Output: [" + res[0] + ", " + res[1] + "]");
    }
}
`,
      c: `#include <stdio.h>

void twoSum(int* nums, int n, int target, int* out) {
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                out[0] = i;
                out[1] = j;
                return;
            }
        }
    }
}

int main() {
    int nums[] = {3, 2, 4};
    int res[2] = {-1, -1};
    twoSum(nums, 3, 6, res);
    printf("Output: [%d, %d]\\n", res[0], res[1]);
    return 0;
}
`,
      javascript: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return [i, j];
            }
        }
    }
    return [];
}

const nums = [3, 2, 4];
console.log("Output:", twoSum(nums, 6));
`
    }
  },
  {
    id: 'palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    goal: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.',
    codeByLang: {
      python: `def isPalindrome(s: str) -> bool:
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]

test = "A man, a plan, a canal: Panama"
print(f'"{test}" -> {isPalindrome(test)}')
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}

int main() {
    string test = "A man, a plan, a canal: Panama";
    cout << "Is Palindrome: " << (isPalindrome(test) ? "true" : "false") << endl;
    return 0;
}
`,
      java: `public class Solution {
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        String test = "A man, a plan, a canal: Panama";
        System.out.println("Is Palindrome: " + isPalindrome(test));
    }
}
`,
      c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

int isPalindrome(const char* s) {
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return 0;
        left++;
        right--;
    }
    return 1;
}

int main() {
    const char* test = "A man, a plan, a canal: Panama";
    printf("Is Palindrome: %s\\n", isPalindrome(test) ? "true" : "false");
    return 0;
}
`,
      javascript: `function isPalindrome(s) {
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
}

const test = "A man, a plan, a canal: Panama";
console.log("Is Palindrome:", isPalindrome(test));
`
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    topic: 'Binary Search',
    goal: 'Given a sorted array and an integer target, write a function to search target in nums. Return its index or -1 if not found. Must run in O(log n).',
    codeByLang: {
      python: `def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

nums = [-1, 0, 3, 5, 9, 12]
print("Index of 9:", search(nums, 9))
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int search(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> nums = {-1, 0, 3, 5, 9, 12};
    cout << "Index of 9: " << search(nums, 9) << endl;
    return 0;
}
`,
      java: `public class Solution {
    public static int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {-1, 0, 3, 5, 9, 12};
        System.out.println("Index of 9: " + search(nums, 9));
    }
}
`,
      c: `#include <stdio.h>

int search(int* nums, int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int nums[] = {-1, 0, 3, 5, 9, 12};
    printf("Index of 9: %d\\n", search(nums, 6, 9));
    return 0;
}
`,
      javascript: `function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

const nums = [-1, 0, 3, 5, 9, 12];
console.log("Index of 9:", search(nums, 9));
`
    }
  }
];

const getMonacoLanguage = (lang) => {
  switch (lang) {
    case 'cpp':
    case 'c++':
      return 'cpp';
    case 'c':
      return 'c';
    case 'java':
      return 'java';
    case 'javascript':
    case 'js':
      return 'javascript';
    default:
      return 'python';
  }
};

export default function CodeStudioPlayground({ onLogProblemSuccess }) {
  const [selectedProblemId, setSelectedProblemId] = useState('two-sum');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(PRESET_PROBLEMS[0].codeByLang.python);
  const [problemGoal, setProblemGoal] = useState(PRESET_PROBLEMS[0].goal);

  // Inspector panel active tab: 'terminal' | 'judge' | 'problem'
  const [activeInspectorTab, setActiveInspectorTab] = useState('terminal');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Evaluation / Judge state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Mobile split view toggle: 'editor' | 'inspector'
  const [mobileActiveView, setMobileActiveView] = useState('editor');

  // Saved feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  const selectedProblem = PRESET_PROBLEMS.find((p) => p.id === selectedProblemId) || PRESET_PROBLEMS[0];

  const handleSelectProblem = (id) => {
    setSelectedProblemId(id);
    const prob = PRESET_PROBLEMS.find((p) => p.id === id);
    if (prob) {
      setProblemGoal(prob.goal);
      if (prob.codeByLang && prob.codeByLang[language]) {
        setCode(prob.codeByLang[language]);
      } else {
        setCode(LANGUAGE_TEMPLATES[language] || '');
      }
      setExecutionResult(null);
      setEvaluationResult(null);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const prob = PRESET_PROBLEMS.find((p) => p.id === selectedProblemId);
    if (prob && prob.codeByLang && prob.codeByLang[newLang]) {
      setCode(prob.codeByLang[newLang]);
    } else {
      setCode(LANGUAGE_TEMPLATES[newLang] || '');
    }
    setExecutionResult(null);
    setEvaluationResult(null);
  };

  const handleResetCode = () => {
    if (selectedProblem.codeByLang && selectedProblem.codeByLang[language]) {
      setCode(selectedProblem.codeByLang[language]);
    } else {
      setCode(LANGUAGE_TEMPLATES[language] || '');
    }
    setExecutionResult(null);
    setEvaluationResult(null);
  };

  // Run Code in Sandbox
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveInspectorTab('terminal');
    setMobileActiveView('inspector');

    try {
      const res = await api.coding.execute({
        code,
        language,
        timeout_seconds: 6
      });
      setExecutionResult(res);

      // Auto-trigger AI Judge evaluation with result
      handleEvaluateCode(res);
    } catch (err) {
      setExecutionResult({
        stdout: '',
        stderr: err.message || 'Sandbox execution failed to connect',
        exit_code: 1,
        runtime_ms: 0,
        timed_out: false,
        language
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Trigger The Brain (AI Judge)
  const handleEvaluateCode = async (currExecResult = executionResult) => {
    setIsEvaluating(true);
    setMobileActiveView('inspector');

    try {
      const evalPayload = {
        code,
        language,
        problem_title: selectedProblem.title,
        problem_goal: problemGoal,
        stdout: currExecResult?.stdout || '',
        stderr: currExecResult?.stderr || '',
        exit_code: currExecResult?.exit_code || 0,
        runtime_ms: currExecResult?.runtime_ms || 0
      };

      const res = await api.coding.evaluate(evalPayload);
      setEvaluationResult(res);
      if (res.status === 'logic_error' || res.status === 'runtime_error') {
        setActiveInspectorTab('judge');
      }
    } catch (err) {
      console.warn('AI evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 1-Click Apply Fix to Monaco Editor
  const handleApplyFix = (fixedCode) => {
    if (!fixedCode) return;
    setCode(fixedCode);
    setEvaluationResult((prev) => ({
      ...prev,
      status: 'passed',
      verdict: 'Fix Applied to Editor! Run again to verify ✨'
    }));
  };

  // Save Solved Problem to PostgreSQL DB
  const handleSaveToBank = async () => {
    try {
      const langNames = {
        python: 'Python',
        cpp: 'C++',
        c: 'C',
        java: 'Java',
        javascript: 'JavaScript'
      };

      await api.coding.create({
        title: selectedProblem.title,
        platform: 'MIND OS Studio',
        topic: selectedProblem.topic || 'Algorithms',
        difficulty: selectedProblem.difficulty || 'Medium',
        status: evaluationResult?.status === 'passed' ? 'Solved' : 'Attempted',
        programming_language: langNames[language] || 'Python',
        solution_code: code,
        correct_approach: evaluationResult?.suggested_fix || 'Verified optimal solution via Life OS Sandbox',
        mistake_learning: evaluationResult?.detected_issues?.join('; ') || '',
        time_taken_minutes: 15
      });

      setSaveSuccessMsg('Problem & Code Saved to Bank! ✅');
      setTimeout(() => setSaveSuccessMsg(null), 3000);

      if (onLogProblemSuccess) {
        onLogProblemSuccess();
      }
    } catch (err) {
      console.error('Failed to save coding record:', err);
    }
  };

  // Keyboard shortcut: Ctrl + Enter to run
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, problemGoal, isRunning]);

  return (
    <div className="code-studio-container">
      {/* 1. TOP TOOLBAR */}
      <div className="studio-topbar">
        <div className="studio-topbar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Code2 size={18} color="var(--primary-400)" />
            <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>MIND Studio</span>
          </div>

          {/* Problem Selector Dropdown */}
          <select
            className="studio-problem-select"
            value={selectedProblemId}
            onChange={(e) => handleSelectProblem(e.target.value)}
          >
            {PRESET_PROBLEMS.map((prob) => (
              <option key={prob.id} value={prob.id}>
                {prob.title} ({prob.difficulty})
              </option>
            ))}
          </select>

          {/* Multi-Language Selector Dropdown */}
          <select
            className="studio-problem-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{ fontWeight: 700, color: '#A78BFA' }}
          >
            <option value="python">🐍 Python 3</option>
            <option value="cpp">⚡ C++ (G++ 14)</option>
            <option value="java">☕ Java (JDK 11)</option>
            <option value="c">⚙️ C (GCC 14)</option>
            <option value="javascript">🌐 JavaScript (Node)</option>
          </select>
        </div>

        <div className="studio-topbar-actions">
          {saveSuccessMsg && (
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
              {saveSuccessMsg}
            </span>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetCode}
            title="Reset code template"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSaveToBank}
            title="Save problem and code to your profile history"
            style={{ padding: '0.35rem 0.6rem' }}
          >
            <Save size={13} />
            <span>Save Solution</span>
          </button>

          {/* Execute Code in Sandbox Button */}
          <button
            type="button"
            className="studio-btn-run"
            onClick={handleRunCode}
            disabled={isRunning}
            title="Run Code in Sandbox (Ctrl + Enter)"
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Compiling & Running...' : 'Run Code'}</span>
          </button>

          {/* AI Evaluating Judge Button */}
          <button
            type="button"
            className="studio-btn-judge"
            onClick={() => handleEvaluateCode()}
            disabled={isEvaluating}
            title="Ask AI Judge: Did this run well and give the right answer?"
          >
            <Sparkles size={13} />
            <span>{isEvaluating ? 'Evaluating...' : 'AI Judge'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented View Switcher (Visible on mobile/tablets <= 1024px) */}
      <div className="studio-mobile-view-tabs">
        <button
          type="button"
          className={`studio-mobile-tab-btn ${mobileActiveView === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileActiveView('editor')}
        >
          <Code2 size={14} />
          <span>Code Editor</span>
        </button>
        <button
          type="button"
          className={`studio-mobile-tab-btn ${mobileActiveView === 'inspector' ? 'active' : ''}`}
          onClick={() => setMobileActiveView('inspector')}
        >
          <Zap size={14} color="#A78BFA" />
          <span>Terminal & AI Judge</span>
          {evaluationResult && (
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: evaluationResult.status === 'passed' ? '#10B981' : '#F59E0B'
            }} />
          )}
        </button>
      </div>

      {/* 2. SPLIT IDE WORKSPACE */}
      <div className="studio-workspace-grid">
        {/* LEFT: Monaco Code Editor */}
        <div className={`studio-editor-pane ${mobileActiveView === 'editor' ? 'mobile-active' : 'mobile-hidden'}`}>
          <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 13.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              minimap: { enabled: false },
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 12, bottom: 12 }
            }}
          />

          <div className="studio-editor-statusbar">
            <span>Press <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>Ctrl+Enter</kbd> to Run & Evaluate</span>
            <span style={{ fontWeight: 600, color: '#A78BFA' }}>
              {language.toUpperCase()} • Native Subprocess Sandbox
            </span>
          </div>
        </div>

        {/* RIGHT: Inspector Pane (Terminal, AI Judge, Problem Statement) */}
        <div className={`studio-inspector-pane ${mobileActiveView === 'inspector' ? 'mobile-active' : 'mobile-hidden'}`}>
          <div className="inspector-nav-tabs">
            <button
              type="button"
              className={`inspector-tab-btn ${activeInspectorTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveInspectorTab('terminal')}
            >
              <Terminal size={14} />
              <span>Terminal {executionResult && `(${executionResult.runtime_ms}ms)`}</span>
            </button>

            <button
              type="button"
              className={`inspector-tab-btn ${activeInspectorTab === 'judge' ? 'active' : ''}`}
              onClick={() => setActiveInspectorTab('judge')}
            >
              <BrainCircuit size={14} color="#A78BFA" />
              <span>AI Judge</span>
              {evaluationResult?.status === 'logic_error' && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
              )}
            </button>

            <button
              type="button"
              className={`inspector-tab-btn ${activeInspectorTab === 'problem' ? 'active' : ''}`}
              onClick={() => setActiveInspectorTab('problem')}
            >
              <Info size={14} />
              <span>Goal & Info</span>
            </button>
          </div>

          <div className="inspector-content-area">
            {/* 1. TERMINAL VIEW */}
            {activeInspectorTab === 'terminal' && (
              <div className="studio-terminal-box">
                <div className="terminal-header">
                  <span>TERMINAL OUTPUT ({language.toUpperCase()})</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {executionResult && (
                      <>
                        <span className="terminal-badge-time">
                          <Clock size={11} /> {executionResult.runtime_ms}ms
                        </span>
                        {executionResult.exit_code === 0 ? (
                          <span className="terminal-badge-success">
                            <CheckCircle2 size={12} /> Exit 0
                          </span>
                        ) : (
                          <span className="terminal-badge-error">
                            <XCircle size={12} /> Exit {executionResult.exit_code}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isRunning ? (
                  <div style={{ color: '#818CF8', padding: '1rem 0' }}>
                    ⚡ Compiling & executing in micro-sandbox...
                  </div>
                ) : executionResult ? (
                  <div>
                    {executionResult.stdout && (
                      <div style={{ color: '#38BDF8' }}>{executionResult.stdout}</div>
                    )}
                    {executionResult.stderr && (
                      <div style={{ color: '#F87171', marginTop: executionResult.stdout ? '0.5rem' : 0 }}>
                        {executionResult.stderr}
                      </div>
                    )}
                    {!executionResult.stdout && !executionResult.stderr && (
                      <div style={{ color: '#6B7280' }}>(Process exited cleanly with no output)</div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#6B7280', paddingTop: '1rem' }}>
                    Hit "Run Code" (<kbd>Ctrl+Enter</kbd>) to compile and run your {language.toUpperCase()} code in an isolated sandbox.
                  </div>
                )}
              </div>
            )}

            {/* 2. THE EVALUATING AI AGENT / JUDGE */}
            {activeInspectorTab === 'judge' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {isEvaluating ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#A78BFA' }}>
                    <Sparkles size={24} style={{ animation: 'spin 2s linear infinite', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Evaluating your code correctness...</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Analyzing logic, edge cases, and runtime answer in {language.toUpperCase()}
                    </span>
                  </div>
                ) : evaluationResult ? (
                  <>
                    {/* Verdict Card */}
                    <div className={`judge-card-verdict ${evaluationResult.status}`}>
                      <div className="judge-verdict-title">
                        {evaluationResult.status === 'passed' && <CheckCircle2 size={18} color="#10B981" />}
                        {evaluationResult.status === 'logic_error' && <AlertTriangle size={18} color="#F59E0B" />}
                        {evaluationResult.status === 'runtime_error' && <XCircle size={18} color="#EF4444" />}
                        {evaluationResult.status === 'suboptimal' && <Zap size={18} color="#6366F1" />}
                        <span>{evaluationResult.verdict}</span>
                      </div>
                      <p className="judge-explanation-text">
                        {evaluationResult.correctness_explanation}
                      </p>
                    </div>

                    {/* Big-O Complexity */}
                    <div className="judge-metrics-row">
                      <div className="judge-metric-chip">
                        <span className="judge-metric-label">Time Complexity</span>
                        <span className="judge-metric-value">{evaluationResult.time_complexity || 'O(n)'}</span>
                      </div>
                      <div className="judge-metric-chip">
                        <span className="judge-metric-label">Space Complexity</span>
                        <span className="judge-metric-value">{evaluationResult.space_complexity || 'O(1)'}</span>
                      </div>
                    </div>

                    {/* Detected Issues */}
                    {evaluationResult.detected_issues?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Detected Issues & Edge Cases
                        </span>
                        <ul className="judge-issues-list" style={{ marginTop: '0.35rem' }}>
                          {evaluationResult.detected_issues.map((iss, i) => (
                            <li key={i} className="judge-issue-item">
                              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                              <span>{iss}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 1-Click Fix Patch */}
                    {evaluationResult.suggested_fix && (
                      <div className="judge-fix-box">
                        <div className="judge-fix-header">
                          <span className="judge-fix-title">AI Suggested Fix ({language.toUpperCase()})</span>
                          <button
                            type="button"
                            className="judge-btn-apply"
                            onClick={() => handleApplyFix(evaluationResult.suggested_fix)}
                          >
                            Apply Fix to Editor
                          </button>
                        </div>
                        <div className="judge-fix-code">
                          {evaluationResult.suggested_fix}
                        </div>
                      </div>
                    )}

                    {/* Pro Tips */}
                    {evaluationResult.tips?.length > 0 && (
                      <div style={{ background: 'var(--bg-surface-muted)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                          💡 Optimization Tip
                        </span>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {evaluationResult.tips[0]}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    <BrainCircuit size={28} style={{ opacity: 0.35, margin: '0 auto 0.5rem auto' }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>The AI Judge is Ready</p>
                    <p style={{ fontSize: '0.75rem' }}>
                      Click "AI Judge" or run your code. The agent evaluates whether your code compiled, executed cleanly, and produced the expected answer.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. PROBLEM GOAL & SPECIFICATION */}
            {activeInspectorTab === 'problem' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {selectedProblem.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                    <span className="pill pill-accent" style={{ fontSize: '0.65rem' }}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="pill" style={{ fontSize: '0.65rem', background: 'var(--bg-surface-muted)' }}>
                      {selectedProblem.topic}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Problem Goal & Requirements:
                  </label>
                  <textarea
                    rows={4}
                    value={problemGoal}
                    onChange={(e) => setProblemGoal(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-muted)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      resize: 'vertical'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    The AI Judge uses this goal to determine whether your output is correct.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
