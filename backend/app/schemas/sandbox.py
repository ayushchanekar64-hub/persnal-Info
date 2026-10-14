from typing import Optional, List, Any
from pydantic import BaseModel, Field


class CodeExecuteRequest(BaseModel):
    code: str = Field(..., description="Source code to execute")
    language: str = Field("python", description="Language: python, javascript, nodejs")
    stdin: Optional[str] = Field("", description="Standard input to supply")
    timeout_seconds: Optional[int] = Field(5, description="Timeout limit in seconds (max 10)")


class CodeExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    runtime_ms: int
    timed_out: bool = False
    language: str


class TestCaseModel(BaseModel):
    input: Optional[Any] = None
    expected_output: Optional[Any] = None
    actual_output: Optional[Any] = None
    passed: Optional[bool] = None


class CodeEvaluateRequest(BaseModel):
    code: str = Field(..., description="Source code submitted")
    language: str = Field("python", description="Language of code")
    problem_title: Optional[str] = Field("Custom Coding Task", description="Title of problem")
    problem_goal: Optional[str] = Field("", description="Expected behavior or test criteria")
    test_cases: Optional[List[TestCaseModel]] = Field(default_factory=list)
    stdout: str = Field("", description="Terminal stdout captured")
    stderr: str = Field("", description="Terminal stderr captured")
    exit_code: int = Field(0, description="Exit code from execution")
    runtime_ms: int = Field(0, description="Execution time in milliseconds")


class CodeEvaluateResponse(BaseModel):
    status: str  # "passed", "logic_error", "runtime_error", "timeout", "suboptimal"
    verdict: str  # Short title like "Answer is Correct! ✨"
    summary: str
    correctness_explanation: str
    detected_issues: List[str] = Field(default_factory=list)
    suggested_fix: Optional[str] = None
    time_complexity: Optional[str] = "O(n)"
    space_complexity: Optional[str] = "O(1)"
    tips: List[str] = Field(default_factory=list)
