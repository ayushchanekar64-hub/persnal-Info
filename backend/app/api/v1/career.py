from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.career import CareerProfile, JobApplication, Interview
from backend.app.models.activity import Activity
from backend.app.schemas.career import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    InterviewCreate,
    InterviewResponse,
    CareerProfileUpdate,
    CareerProfileResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("/profile", response_model=CareerProfileResponse)
async def get_career_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CareerProfile).where(CareerProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        profile = CareerProfile(user_id=current_user.id, target_role="")
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


@router.patch("/profile", response_model=CareerProfileResponse)
async def update_career_profile(
    profile_update: CareerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CareerProfile).where(CareerProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        profile = CareerProfile(user_id=current_user.id)
        db.add(profile)

    for field, val in profile_update.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)

    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/applications", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.interviews))
        .where(JobApplication.user_id == current_user.id)
        .order_by(JobApplication.created_at.desc())
    )
    return result.scalars().all()


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    app = JobApplication(
        user_id=current_user.id,
        company=app_in.company,
        role=app_in.role,
        location=app_in.location,
        job_url=app_in.job_url,
        applied_date=app_in.applied_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        status=app_in.status or "Applied",
        salary=app_in.salary,
        contact=app_in.contact,
        notes=app_in.notes,
    )
    db.add(app)
    await db.flush()

    activity = Activity(
        user_id=current_user.id,
        type="career",
        title=f'Applied for {app.role} at {app.company}',
        time_label="Just now",
        color="var(--primary-600)",
    )
    db.add(activity)
    await db.commit()

    result = await db.execute(
        select(JobApplication).options(selectinload(JobApplication.interviews)).where(JobApplication.id == app.id)
    )
    return result.scalars().first()


@router.patch("/applications/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    app_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(JobApplication)
        .options(selectinload(JobApplication.interviews))
        .where(JobApplication.id == app_id, JobApplication.user_id == current_user.id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, val in app_update.model_dump(exclude_unset=True).items():
        setattr(app, field, val)

    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app


@router.delete("/applications/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(JobApplication).where(JobApplication.id == app_id, JobApplication.user_id == current_user.id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    await db.delete(app)
    await db.commit()
    return None


@router.post("/interviews", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    interview_in: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify application ownership
    result = await db.execute(
        select(JobApplication).where(JobApplication.id == interview_in.application_id, JobApplication.user_id == current_user.id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    interview = Interview(
        application_id=app.id,
        user_id=current_user.id,
        company=interview_in.company or app.company,
        role=interview_in.role or app.role,
        interview_date=interview_in.interview_date,
        round_name=interview_in.round_name or "Technical Round",
        questions=interview_in.questions,
        preparation=interview_in.preparation,
        performance=interview_in.performance,
        feedback=interview_in.feedback,
        notes=interview_in.notes,
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)
    return interview
