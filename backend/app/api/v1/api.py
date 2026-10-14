from fastapi import APIRouter
from backend.app.api.v1 import (
    auth,
    tasks,
    goals,
    habits,
    notes,
    learning,
    coding,
    career,
    finance,
    analytics,
    activity,
    notifications,
    search,
    ai,
    profile,
    family,
    inbox,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inbox.router, prefix="/inbox", tags=["inbox"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(family.router, prefix="/family", tags=["family"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(learning.router, prefix="/learning", tags=["learning"])
api_router.include_router(coding.router, prefix="/coding", tags=["coding"])
api_router.include_router(career.router, prefix="/career", tags=["career"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
