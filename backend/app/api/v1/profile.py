from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.app.db.session import get_db
from backend.app.db.base import utc_now
from backend.app.models.user import User
from backend.app.models.profile import (
    UserProfile,
    UserEducation,
    UserCertification,
    UserExperience,
    UserCareerPreference,
    UserSkill,
    UserLinks,
    UserPreferences,
    UserDocument,
    UserContact,
)
from backend.app.schemas.profile import (
    BasicProfileUpdate,
    BasicProfileResponse,
    EducationCreate,
    EducationUpdate,
    EducationResponse,
    CertificationCreate,
    CertificationUpdate,
    CertificationResponse,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceResponse,
    CareerPreferenceUpdate,
    CareerPreferenceResponse,
    SkillCreate,
    SkillUpdate,
    SkillResponse,
    LinksUpdate,
    LinksResponse,
    PreferencesUpdate,
    PreferencesResponse,
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    PersonalDatabaseResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


def calculate_completion(
    basic: Optional[UserProfile],
    educations: List[UserEducation],
    certifications: List[UserCertification],
    experiences: List[UserExperience],
    career: Optional[UserCareerPreference],
    skills: List[UserSkill],
    links: Optional[UserLinks],
    preferences: Optional[UserPreferences],
    documents: List[UserDocument],
    contacts: List[UserContact],
) -> tuple[int, Dict[str, int]]:
    """Calculates overall & section-by-section profile completion %"""
    scores = {}

    # 1. Basic (Max 20%)
    basic_fields = [
        basic.full_name if basic else None,
        basic.dob if basic else None,
        basic.gender if basic else None,
        basic.phone_number if basic else None,
        basic.primary_email if basic else None,
        basic.city if basic else None,
        basic.country if basic else None,
        basic.bio if basic else None,
    ]
    filled_basic = sum(1 for f in basic_fields if f and str(f).strip())
    scores["basic"] = min(100, int((filled_basic / len(basic_fields)) * 100))

    # 2. Education & Certs (Max 15%)
    has_edu = len(educations) > 0
    has_cert = len(certifications) > 0
    scores["education"] = 100 if (has_edu and has_cert) else (70 if has_edu else (40 if has_cert else 0))

    # 3. Career & Experience (Max 15%)
    has_exp = len(experiences) > 0
    has_pref = career and (career.current_role or career.target_role)
    scores["career"] = 100 if (has_exp and has_pref) else (70 if has_exp or has_pref else 0)

    # 4. Skills (Max 15%)
    skill_count = len(skills)
    scores["skills"] = min(100, int((skill_count / 5) * 100))

    # 5. Links (Max 10%)
    link_fields = [
        links.linkedin if links else None,
        links.github if links else None,
        links.portfolio if links else None,
        links.leetcode if links else None,
    ]
    filled_links = sum(1 for f in link_fields if f and str(f).strip())
    scores["links"] = min(100, int((filled_links / 2) * 100))

    # 6. Preferences (Max 10%)
    pref_fields = [
        preferences.interests if preferences else None,
        preferences.favorite_technologies if preferences else None,
        preferences.goals_aspirations if preferences else None,
    ]
    filled_pref = sum(1 for f in pref_fields if f and str(f).strip())
    scores["preferences"] = min(100, int((filled_pref / len(pref_fields)) * 100))

    # 7. Documents (Max 10%)
    scores["documents"] = 100 if len(documents) >= 1 else 0

    # 8. Contacts (Max 5%)
    scores["contacts"] = 100 if len(contacts) >= 1 else 0

    # Weighted Total Score
    total = int(
        (scores["basic"] * 0.20)
        + (scores["education"] * 0.15)
        + (scores["career"] * 0.15)
        + (scores["skills"] * 0.15)
        + (scores["links"] * 0.10)
        + (scores["preferences"] * 0.10)
        + (scores["documents"] * 0.10)
        + (scores["contacts"] * 0.05)
    )

    return total, scores


# ====================================================================
# AGGREGATED PERSONAL DATABASE
# ====================================================================

@router.get("", response_model=PersonalDatabaseResponse)
async def get_personal_database(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full personal database for authenticated user."""
    # 1. Basic
    basic_res = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    basic = basic_res.scalars().first()

    # 2. Education & Certifications
    edu_res = await db.execute(select(UserEducation).where(UserEducation.user_id == current_user.id).order_by(UserEducation.start_date.desc()))
    educations = edu_res.scalars().all()

    cert_res = await db.execute(select(UserCertification).where(UserCertification.user_id == current_user.id).order_by(UserCertification.issue_date.desc()))
    certifications = cert_res.scalars().all()

    # 3. Experience & Career
    exp_res = await db.execute(select(UserExperience).where(UserExperience.user_id == current_user.id).order_by(UserExperience.start_date.desc()))
    experiences = exp_res.scalars().all()

    career_res = await db.execute(select(UserCareerPreference).where(UserCareerPreference.user_id == current_user.id))
    career = career_res.scalars().first()

    # 4. Skills
    skills_res = await db.execute(select(UserSkill).where(UserSkill.user_id == current_user.id).order_by(UserSkill.proficiency.desc()))
    skills = skills_res.scalars().all()

    # 5. Links
    links_res = await db.execute(select(UserLinks).where(UserLinks.user_id == current_user.id))
    links = links_res.scalars().first()

    # 6. Preferences
    pref_res = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    preferences = pref_res.scalars().first()

    # 7. Documents
    docs_res = await db.execute(select(UserDocument).where(UserDocument.user_id == current_user.id).order_by(UserDocument.created_at.desc()))
    documents = docs_res.scalars().all()

    # 8. Contacts
    contacts_res = await db.execute(select(UserContact).where(UserContact.user_id == current_user.id).order_by(UserContact.created_at.desc()))
    contacts = contacts_res.scalars().all()

    total_score, section_scores = calculate_completion(
        basic, educations, certifications, experiences, career, skills, links, preferences, documents, contacts
    )

    system_profile = {
        "user_id": current_user.id,
        "username": current_user.email.split("@")[0],
        "account_email": current_user.email,
        "role": current_user.role or "Member",
        "account_created": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": datetime.now(timezone.utc).isoformat(),
        "is_active": current_user.is_active,
        "profile_updated_at": basic.updated_at.isoformat() if basic and basic.updated_at else datetime.now(timezone.utc).isoformat(),
    }

    return PersonalDatabaseResponse(
        basic=basic,
        educations=educations,
        certifications=certifications,
        experiences=experiences,
        career_preference=career,
        skills=skills,
        links=links,
        preferences=preferences,
        documents=documents,
        contacts=contacts,
        system_profile=system_profile,
        completion_score=total_score,
        section_completion=section_scores,
    )


# ====================================================================
# 1. BASIC PROFILE
# ====================================================================

@router.patch("/basic", response_model=BasicProfileResponse)
async def update_basic_profile(
    payload: BasicProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = res.scalars().first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            full_name=payload.full_name or current_user.name,
            primary_email=payload.primary_email or current_user.email,
            **payload.model_dump(exclude_unset=True, exclude={"full_name", "primary_email"}),
        )
        db.add(profile)
    else:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(profile, k, v)
        profile.updated_at = utc_now()

    # Sync user name and avatar if provided
    if payload.full_name:
        current_user.name = payload.full_name
    if payload.profile_photo:
        current_user.avatar = payload.profile_photo[:50]

    await db.commit()
    await db.refresh(profile)
    return profile


# ====================================================================
# 2. EDUCATION & CERTIFICATIONS
# ====================================================================

@router.post("/education", response_model=EducationResponse)
async def create_education(
    payload: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    edu = UserEducation(user_id=current_user.id, **payload.model_dump())
    db.add(edu)
    await db.commit()
    await db.refresh(edu)
    return edu


@router.patch("/education/{edu_id}", response_model=EducationResponse)
async def update_education(
    edu_id: str,
    payload: EducationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserEducation).where(UserEducation.id == edu_id, UserEducation.user_id == current_user.id))
    edu = res.scalars().first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(edu, k, v)
    edu.updated_at = utc_now()
    await db.commit()
    await db.refresh(edu)
    return edu


@router.delete("/education/{edu_id}")
async def delete_education(
    edu_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserEducation).where(UserEducation.id == edu_id, UserEducation.user_id == current_user.id))
    edu = res.scalars().first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    await db.delete(edu)
    await db.commit()
    return {"message": "Education record deleted"}


@router.post("/certification", response_model=CertificationResponse)
async def create_certification(
    payload: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cert = UserCertification(user_id=current_user.id, **payload.model_dump())
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


@router.patch("/certification/{cert_id}", response_model=CertificationResponse)
async def update_certification(
    cert_id: str,
    payload: CertificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserCertification).where(UserCertification.id == cert_id, UserCertification.user_id == current_user.id))
    cert = res.scalars().first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cert, k, v)
    cert.updated_at = utc_now()
    await db.commit()
    await db.refresh(cert)
    return cert


@router.delete("/certification/{cert_id}")
async def delete_certification(
    cert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserCertification).where(UserCertification.id == cert_id, UserCertification.user_id == current_user.id))
    cert = res.scalars().first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    await db.delete(cert)
    await db.commit()
    return {"message": "Certification deleted"}


# ====================================================================
# 3. WORK EXPERIENCE & CAREER TARGETS
# ====================================================================

@router.post("/experience", response_model=ExperienceResponse)
async def create_experience(
    payload: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    exp = UserExperience(user_id=current_user.id, **payload.model_dump())
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp


@router.patch("/experience/{exp_id}", response_model=ExperienceResponse)
async def update_experience(
    exp_id: str,
    payload: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserExperience).where(UserExperience.id == exp_id, UserExperience.user_id == current_user.id))
    exp = res.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(exp, k, v)
    exp.updated_at = utc_now()
    await db.commit()
    await db.refresh(exp)
    return exp


@router.delete("/experience/{exp_id}")
async def delete_experience(
    exp_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserExperience).where(UserExperience.id == exp_id, UserExperience.user_id == current_user.id))
    exp = res.scalars().first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    await db.delete(exp)
    await db.commit()
    return {"message": "Experience record deleted"}


@router.patch("/career", response_model=CareerPreferenceResponse)
async def update_career_preference(
    payload: CareerPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserCareerPreference).where(UserCareerPreference.user_id == current_user.id))
    career = res.scalars().first()

    if not career:
        career = UserCareerPreference(user_id=current_user.id, **payload.model_dump(exclude_unset=True))
        db.add(career)
    else:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(career, k, v)
        career.updated_at = utc_now()

    await db.commit()
    await db.refresh(career)
    return career


# ====================================================================
# 4. SKILLS
# ====================================================================

@router.post("/skills", response_model=SkillResponse)
async def create_skill(
    payload: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skill = UserSkill(user_id=current_user.id, **payload.model_dump())
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


@router.patch("/skills/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: str,
    payload: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserSkill).where(UserSkill.id == skill_id, UserSkill.user_id == current_user.id))
    skill = res.scalars().first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(skill, k, v)
    skill.updated_at = utc_now()
    await db.commit()
    await db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserSkill).where(UserSkill.id == skill_id, UserSkill.user_id == current_user.id))
    skill = res.scalars().first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    await db.delete(skill)
    await db.commit()
    return {"message": "Skill deleted"}


# ====================================================================
# 5. PROFESSIONAL LINKS
# ====================================================================

@router.patch("/links", response_model=LinksResponse)
async def update_links(
    payload: LinksUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserLinks).where(UserLinks.user_id == current_user.id))
    links = res.scalars().first()

    if not links:
        links = UserLinks(user_id=current_user.id, **payload.model_dump(exclude_unset=True))
        db.add(links)
    else:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(links, k, v)
        links.updated_at = utc_now()

    await db.commit()
    await db.refresh(links)
    return links


# ====================================================================
# 6. PERSONAL PREFERENCES
# ====================================================================

@router.patch("/preferences", response_model=PreferencesResponse)
async def update_preferences(
    payload: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    pref = res.scalars().first()

    if not pref:
        pref = UserPreferences(user_id=current_user.id, **payload.model_dump(exclude_unset=True))
        db.add(pref)
    else:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(pref, k, v)
        pref.updated_at = utc_now()

    await db.commit()
    await db.refresh(pref)
    return pref


# ====================================================================
# 7. DOCUMENTS
# ====================================================================

@router.post("/documents", response_model=DocumentResponse)
async def create_document(
    payload: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    upload_date = payload.upload_date or datetime.now(timezone.utc).strftime("%b %d, %Y")
    doc = UserDocument(
        user_id=current_user.id,
        upload_date=upload_date,
        **payload.model_dump(exclude={"upload_date"}),
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.patch("/documents/{doc_id}", response_model=DocumentResponse)
async def update_document(
    doc_id: str,
    payload: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserDocument).where(UserDocument.id == doc_id, UserDocument.user_id == current_user.id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(doc, field, val)
    doc.updated_at = utc_now()
    await db.commit()
    await db.refresh(doc)
    return doc


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserDocument).where(UserDocument.id == doc_id, UserDocument.user_id == current_user.id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted"}


# ====================================================================
# 8. IMPORTANT CONTACTS
# ====================================================================

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(
    payload: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    contact = UserContact(user_id=current_user.id, **payload.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: str,
    payload: ContactUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserContact).where(UserContact.id == contact_id, UserContact.user_id == current_user.id))
    contact = res.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(contact, k, v)
    contact.updated_at = utc_now()
    await db.commit()
    await db.refresh(contact)
    return contact


@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(UserContact).where(UserContact.id == contact_id, UserContact.user_id == current_user.id))
    contact = res.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await db.delete(contact)
    await db.commit()
    return {"message": "Contact deleted"}
