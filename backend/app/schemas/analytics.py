from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class DayAnalytics(BaseModel):
    day: str
    tasks: int = 0
    hours: float = 0.0
    coding: int = 0


class DashboardStats(BaseModel):
    tasksRemaining: int = 0
    tasksTotal: int = 0
    activeGoals: int = 0
    goalsDueSoon: int = 0
    learningHours: float = 0.0
    codingSolved: int = 0
    focusTime: str = "0h"
    focusSessions: int = 0
    codingStreak: int = 0


class AnalyticsSummary(BaseModel):
    stats: DashboardStats
    weeklyAnalytics: List[DayAnalytics]
    taskCompletionRate: float = 0.0
    habitsCompletionRate: float = 0.0
    monthlyIncome: float = 0.0
    monthlyExpenses: float = 0.0
    savingsRate: float = 0.0
    codingDifficultyBreakdown: Dict[str, int] = {"Easy": 0, "Medium": 0, "Hard": 0}
    topTopics: List[Dict[str, Any]] = []
