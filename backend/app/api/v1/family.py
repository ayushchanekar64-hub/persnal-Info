from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db
from backend.app.db.base import utc_now
from backend.app.models.user import User
from backend.app.models.family import (
    FamilyMember,
    FamilyMemberEducation,
    FamilyMemberCareer,
    FamilyMemberDocument,
    FamilyMemberContact,
)
from backend.app.schemas.family import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberListResponse,
    FamilyMemberDetailResponse,
    FamilyMemberEducationCreate,
    FamilyMemberEducationUpdate,
    FamilyMemberEducationResponse,
    FamilyMemberCareerCreate,
    FamilyMemberCareerUpdate,
    FamilyMemberCareerResponse,
    FamilyMemberDocumentCreate,
    FamilyMemberDocumentResponse,
    FamilyMemberContactCreate,
    FamilyMemberContactResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


# Helper: verify family member belongs to authenticated user
async def get_user_family_member(
    member_id: str,
    user_id: str,
    db: AsyncSession,
    load_relations: bool = False
) -> FamilyMember:
    stmt = select(FamilyMember).where(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user_id
    )
    if load_relations:
        stmt = stmt.options(
            selectinload(FamilyMember.educations),
            selectinload(FamilyMember.careers),
            selectinload(FamilyMember.documents),
            selectinload(FamilyMember.contacts),
        )
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    return member


# ===========================================================================
# 1. CORE FAMILY MEMBERS CRUD
# ===========================================================================

@router.get("", response_model=List[FamilyMemberListResponse])
async def list_family_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all family members belonging to the authenticated user"""
    stmt = (
        select(FamilyMember)
        .where(FamilyMember.user_id == current_user.id)
        .options(
            selectinload(FamilyMember.educations),
            selectinload(FamilyMember.careers),
            selectinload(FamilyMember.documents),
        )
        .order_by(FamilyMember.created_at.asc())
    )
    result = await db.execute(stmt)
    members = result.scalars().all()

    response = []
    for m in members:
        response.append(
            FamilyMemberListResponse(
                id=m.id,
                full_name=m.full_name,
                relationship_type=m.relationship_type,
                profile_photo=m.profile_photo,
                dob=m.dob,
                gender=m.gender,
                phone=m.phone,
                email=m.email,
                city=m.city,
                country=m.country,
                education_count=len(m.educations or []),
                career_count=len(m.careers or []),
                document_count=len(m.documents or []),
                emergency_contact_name=m.emergency_contact_name,
                emergency_phone=m.emergency_phone,
                created_at=m.created_at,
                updated_at=m.updated_at,
            )
        )
    return response


@router.post("", response_model=FamilyMemberDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    payload: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a new family member strictly associated with current_user"""
    member = FamilyMember(
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    # Return with empty relation lists
    return await get_user_family_member(member.id, current_user.id, db, load_relations=True)


@router.get("/{member_id}", response_model=FamilyMemberDetailResponse)
async def get_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get full detailed profile of a family member"""
    return await get_user_family_member(member_id, current_user.id, db, load_relations=True)


@router.put("/{member_id}", response_model=FamilyMemberDetailResponse)
async def update_family_member(
    member_id: str,
    payload: FamilyMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update family member profile information"""
    member = await get_user_family_member(member_id, current_user.id, db, load_relations=True)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(member, field, val)

    member.updated_at = utc_now()
    await db.commit()
    await db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a family member and cascade-remove all their related sub-records"""
    member = await get_user_family_member(member_id, current_user.id, db)
    await db.delete(member)
    await db.commit()
    return None


# ===========================================================================
# 2. EDUCATION SUB-RECORDS
# ===========================================================================

@router.post("/{member_id}/education", response_model=FamilyMemberEducationResponse, status_code=status.HTTP_201_CREATED)
async def add_family_education(
    member_id: str,
    payload: FamilyMemberEducationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add education record to a family member"""
    await get_user_family_member(member_id, current_user.id, db)

    edu = FamilyMemberEducation(
        family_member_id=member_id,
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(edu)
    await db.commit()
    await db.refresh(edu)
    return edu


@router.delete("/{member_id}/education/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_education(
    member_id: str,
    edu_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete education record"""
    await get_user_family_member(member_id, current_user.id, db)

    stmt = select(FamilyMemberEducation).where(
        FamilyMemberEducation.id == edu_id,
        FamilyMemberEducation.family_member_id == member_id,
        FamilyMemberEducation.user_id == current_user.id
    )
    res = await db.execute(stmt)
    edu = res.scalar_one_or_none()
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found")

    await db.delete(edu)
    await db.commit()
    return None


# ===========================================================================
# 3. CAREER SUB-RECORDS
# ===========================================================================

@router.post("/{member_id}/career", response_model=FamilyMemberCareerResponse, status_code=status.HTTP_201_CREATED)
async def add_family_career(
    member_id: str,
    payload: FamilyMemberCareerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add career/experience record to a family member"""
    await get_user_family_member(member_id, current_user.id, db)

    career = FamilyMemberCareer(
        family_member_id=member_id,
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(career)
    await db.commit()
    await db.refresh(career)
    return career


@router.delete("/{member_id}/career/{career_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_career(
    member_id: str,
    career_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete career record"""
    await get_user_family_member(member_id, current_user.id, db)

    stmt = select(FamilyMemberCareer).where(
        FamilyMemberCareer.id == career_id,
        FamilyMemberCareer.family_member_id == member_id,
        FamilyMemberCareer.user_id == current_user.id
    )
    res = await db.execute(stmt)
    career = res.scalar_one_or_none()
    if not career:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career record not found")

    await db.delete(career)
    await db.commit()
    return None


# ===========================================================================
# 4. DOCUMENTS SUB-RECORDS
# ===========================================================================

@router.post("/{member_id}/documents", response_model=FamilyMemberDocumentResponse, status_code=status.HTTP_201_CREATED)
async def add_family_document(
    member_id: str,
    payload: FamilyMemberDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add document to a family member's vault"""
    await get_user_family_member(member_id, current_user.id, db)

    doc = FamilyMemberDocument(
        family_member_id=member_id,
        user_id=current_user.id,
        upload_date=payload.upload_date or utc_now().strftime("%Y-%m-%d"),
        **payload.model_dump(exclude={"upload_date"})
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.delete("/{member_id}/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_document(
    member_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete document from vault"""
    await get_user_family_member(member_id, current_user.id, db)

    stmt = select(FamilyMemberDocument).where(
        FamilyMemberDocument.id == doc_id,
        FamilyMemberDocument.family_member_id == member_id,
        FamilyMemberDocument.user_id == current_user.id
    )
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    await db.delete(doc)
    await db.commit()
    return None


# ===========================================================================
# 5. EMERGENCY / IMPORTANT CONTACTS
# ===========================================================================

@router.post("/{member_id}/contacts", response_model=FamilyMemberContactResponse, status_code=status.HTTP_201_CREATED)
async def add_family_contact(
    member_id: str,
    payload: FamilyMemberContactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add emergency or important contact for this family member"""
    await get_user_family_member(member_id, current_user.id, db)

    contact = FamilyMemberContact(
        family_member_id=member_id,
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


@router.delete("/{member_id}/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_contact(
    member_id: str,
    contact_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete emergency contact"""
    await get_user_family_member(member_id, current_user.id, db)

    stmt = select(FamilyMemberContact).where(
        FamilyMemberContact.id == contact_id,
        FamilyMemberContact.family_member_id == member_id,
        FamilyMemberContact.user_id == current_user.id
    )
    res = await db.execute(stmt)
    contact = res.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    await db.delete(contact)
    await db.commit()
    return None
