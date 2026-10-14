import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  FileText,
  Heart,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  Download,
  AlertTriangle,
  User,
  Shield,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';
import AddEditMemberModal from '../modals/AddEditMemberModal';
import FamilySubModal from '../modals/FamilySubModal';
import DocumentViewerModal from '../modals/DocumentViewerModal';
import '../../styles/family.css';

export default function FamilyView({ user, onNavigate }) {
  // State
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberDetail, setMemberDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRel, setFilterRel] = useState('All');

  // Active Tab inside Member Profile
  const [activeTab, setActiveTab] = useState('basic');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMemberData, setEditingMemberData] = useState(null);

  const [subModalType, setSubModalType] = useState(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Status & Notification feedback
  const [statusMsg, setStatusMsg] = useState(null);

  const showStatus = (text, isError = false) => {
    setStatusMsg({ text, isError });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // Fetch All Members
  // --------------------------------------------------------------------------
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.family.list();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load family members:', err.message);
      showStatus('Unable to load family members from vault', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --------------------------------------------------------------------------
  // Fetch Detailed Member Profile
  // --------------------------------------------------------------------------
  const fetchMemberDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      setDetailLoading(true);
      const data = await api.family.get(id);
      setMemberDetail(data);
    } catch (err) {
      console.warn('Failed to load member detail:', err.message);
      showStatus('Failed to load full member profile', true);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMemberId) {
      fetchMemberDetail(selectedMemberId);
    } else {
      setMemberDetail(null);
    }
  }, [selectedMemberId, fetchMemberDetail]);

  // --------------------------------------------------------------------------
  // CRUD Actions
  // --------------------------------------------------------------------------
  const handleSaveMember = async (formData) => {
    if (editingMemberData?.id) {
      // Update
      const updated = await api.family.update(editingMemberData.id, formData);
      showStatus(`${formData.full_name} updated successfully`);
      if (selectedMemberId === editingMemberData.id) {
        setMemberDetail(updated);
      }
    } else {
      // Create
      await api.family.create(formData);
      showStatus(`Family member ${formData.full_name} added to vault`);
    }
    fetchMembers();
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} and all their records from your vault?`)) {
      return;
    }
    try {
      await api.family.delete(memberId);
      showStatus(`${memberName} removed from family vault`);
      if (selectedMemberId === memberId) {
        setSelectedMemberId(null);
      }
      fetchMembers();
    } catch (err) {
      showStatus('Failed to delete member', true);
    }
  };

  // Sub-items (Education, Career, Document, Contact)
  const handleSaveSubItem = async (subFormData) => {
    if (!selectedMemberId || !subModalType) return;
    try {
      if (subModalType === 'education') {
        await api.family.addEducation(selectedMemberId, subFormData);
        showStatus('Education record added');
      } else if (subModalType === 'career') {
        await api.family.addCareer(selectedMemberId, subFormData);
        showStatus('Career experience added');
      } else if (subModalType === 'document') {
        await api.family.addDocument(selectedMemberId, subFormData);
        showStatus('Document uploaded to vault');
      } else if (subModalType === 'contact') {
        await api.family.addContact(selectedMemberId, subFormData);
        showStatus('Contact recorded');
      }
      fetchMemberDetail(selectedMemberId);
      fetchMembers();
    } catch (err) {
      showStatus(`Failed to add ${subModalType}`, true);
    }
  };

  const handleDeleteEducation = async (eduId) => {
    if (!window.confirm('Delete this education record?')) return;
    try {
      await api.family.deleteEducation(selectedMemberId, eduId);
      fetchMemberDetail(selectedMemberId);
      showStatus('Education record deleted');
    } catch {
      showStatus('Failed to delete education record', true);
    }
  };

  const handleDeleteCareer = async (careerId) => {
    if (!window.confirm('Delete this career record?')) return;
    try {
      await api.family.deleteCareer(selectedMemberId, careerId);
      fetchMemberDetail(selectedMemberId);
      showStatus('Career record deleted');
    } catch {
      showStatus('Failed to delete career record', true);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Remove this document from the vault?')) return;
    try {
      await api.family.deleteDocument(selectedMemberId, docId);
      fetchMemberDetail(selectedMemberId);
      showStatus('Document removed from vault');
    } catch {
      showStatus('Failed to delete document', true);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.family.deleteContact(selectedMemberId, contactId);
      fetchMemberDetail(selectedMemberId);
      showStatus('Contact deleted');
    } catch {
      showStatus('Failed to delete contact', true);
    }
  };

  // Inline Note / Preference Save
  const handleSaveInlineText = async (fieldName, val) => {
    if (!selectedMemberId) return;
    try {
      await api.family.update(selectedMemberId, { [fieldName]: val });
      setMemberDetail(prev => ({ ...prev, [fieldName]: val }));
      showStatus('Saved successfully');
    } catch {
      showStatus('Failed to save changes', true);
    }
  };

  // Helper for Relationship Badges
  const getBadgeClass = (rel) => {
    const r = (rel || '').toLowerCase();
    if (r.includes('father') || r.includes('mother') || r.includes('parent')) return 'rel-badge parent';
    if (r.includes('spouse') || r.includes('wife') || r.includes('husband')) return 'rel-badge spouse';
    if (r.includes('son') || r.includes('daughter') || r.includes('child')) return 'rel-badge child';
    if (r.includes('brother') || r.includes('sister') || r.includes('sibling')) return 'rel-badge sibling';
    return 'rel-badge';
  };

  // Filter Members
  const filteredMembers = members.filter(m => {
    const matchSearch =
      m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.relationship_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filterRel === 'All') return true;
    return m.relationship_type?.toLowerCase() === filterRel.toLowerCase();
  });

  // ==========================================================================
  // RENDER: MEMBER PROFILE DETAIL VIEW
  // ==========================================================================
  if (selectedMemberId && memberDetail) {
    return (
      <div className="family-view-container animate-fade-in-up">
        {/* Status Toast */}
        {statusMsg && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: statusMsg.isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#FFFFFF',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {statusMsg.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Top Bar Navigation */}
        <div className="family-profile-nav-header">
          <button
            className="btn-back-directory"
            onClick={() => setSelectedMemberId(null)}
          >
            <ArrowLeft size={16} />
            <span>Back to Family Directory</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              className="btn-card-view"
              onClick={() => {
                setEditingMemberData(memberDetail);
                setIsAddEditModalOpen(true);
              }}
            >
              <Edit3 size={15} />
              <span>Edit Details</span>
            </button>
            <button
              className="btn-card-icon danger"
              onClick={() => handleDeleteMember(memberDetail.id, memberDetail.full_name)}
              title="Delete Member"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="family-hero-card">
          <div className="family-hero-left">
            <div className="family-hero-avatar-wrap">
              {memberDetail.profile_photo ? (
                <img src={memberDetail.profile_photo} alt={memberDetail.full_name} className="family-hero-avatar-img" />
              ) : (
                <div className="family-hero-avatar-fallback">
                  {memberDetail.full_name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
              )}
            </div>

            <div className="family-hero-details">
              <div className="family-hero-title-row">
                <h2>{memberDetail.full_name}</h2>
                <span className={getBadgeClass(memberDetail.relationship_type)}>
                  {memberDetail.relationship_type}
                </span>
              </div>

              <div className="family-hero-contact-row">
                {memberDetail.phone && (
                  <a href={`tel:${memberDetail.phone}`} className="family-hero-contact-item" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Phone size={14} color="#818CF8" />
                    <span>{memberDetail.phone}</span>
                  </a>
                )}
                {memberDetail.email && (
                  <a href={`mailto:${memberDetail.email}`} className="family-hero-contact-item" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Mail size={14} color="#818CF8" />
                    <span>{memberDetail.email}</span>
                  </a>
                )}
                {(memberDetail.city || memberDetail.country) && (
                  <div className="family-hero-contact-item">
                    <MapPin size={14} color="#818CF8" />
                    <span>{[memberDetail.city, memberDetail.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              {memberDetail.bio && (
                <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {memberDetail.bio}
                </p>
              )}
            </div>
          </div>

          <div className="family-hero-actions">
            {memberDetail.emergency_phone && (
              <a
                href={`tel:${memberDetail.emergency_phone}`}
                className="btn-primary-glow"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', textDecoration: 'none' }}
                title={`Call Emergency: ${memberDetail.emergency_contact_name || 'Emergency Contact'}`}
              >
                <Phone size={15} />
                <span>Emergency: {memberDetail.emergency_phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* 8-Tab Navigation Bar */}
        <div className="family-tabs-bar">
          <button
            className={`family-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <User size={16} />
            <span>1. Basic Information</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <GraduationCap size={16} />
            <span>2. Education</span>
            <span className="family-tab-count">{memberDetail.educations?.length || 0}</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'career' ? 'active' : ''}`}
            onClick={() => setActiveTab('career')}
          >
            <Briefcase size={16} />
            <span>3. Career</span>
            <span className="family-tab-count">{memberDetail.careers?.length || 0}</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <ExternalLink size={16} />
            <span>4. Professional Links</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} />
            <span>5. Documents Vault</span>
            <span className="family-tab-count">{memberDetail.documents?.length || 0}</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={16} />
            <span>6. Important Information</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <Heart size={16} />
            <span>7. Emergency Details</span>
          </button>

          <button
            className={`family-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <Edit3 size={16} />
            <span>8. Additional Notes</span>
          </button>
        </div>

        {/* ==================================================================
            TAB PANELS CONTENT
            ================================================================== */}
        <div className="family-tab-panel">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <User size={18} color="#818CF8" />
                  Basic Profile Details
                </h3>
                <button
                  className="btn-card-view"
                  onClick={() => {
                    setEditingMemberData(memberDetail);
                    setIsAddEditModalOpen(true);
                  }}
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="family-info-grid">
                <div className="family-info-field">
                  <span className="family-info-label">Full Name</span>
                  <span className="family-info-val">{memberDetail.full_name || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Relationship</span>
                  <span className="family-info-val">{memberDetail.relationship_type || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Date of Birth</span>
                  <span className="family-info-val">{memberDetail.dob || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Gender</span>
                  <span className="family-info-val">{memberDetail.gender || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Phone</span>
                  <span className="family-info-val">{memberDetail.phone || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Email</span>
                  <span className="family-info-val">{memberDetail.email || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">City</span>
                  <span className="family-info-val">{memberDetail.city || '—'}</span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Country</span>
                  <span className="family-info-val">{memberDetail.country || '—'}</span>
                </div>

                <div className="family-info-field" style={{ gridColumn: '1 / -1' }}>
                  <span className="family-info-label">Residential Address</span>
                  <span className="family-info-val">{memberDetail.address || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === 'education' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <GraduationCap size={18} color="#818CF8" />
                  Education & Academic Qualifications
                </h3>
                <button
                  className="btn-primary-glow"
                  onClick={() => {
                    setSubModalType('education');
                    setIsSubModalOpen(true);
                  }}
                >
                  <Plus size={15} />
                  <span>Add Education</span>
                </button>
              </div>

              {(!memberDetail.educations || memberDetail.educations.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  No education records added yet for {memberDetail.full_name}.
                </div>
              ) : (
                <div className="family-items-list">
                  {memberDetail.educations.map(edu => (
                    <div key={edu.id} className="family-item-card">
                      <div className="family-item-main">
                        <div className="family-item-icon-wrap">
                          <GraduationCap size={22} />
                        </div>
                        <div className="family-item-content">
                          <h4 className="family-item-title">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</h4>
                          <span className="family-item-sub">{edu.institution}</span>
                          <span className="family-item-dates">
                            {[edu.start_date, edu.end_date || (edu.is_current ? 'Present' : '')].filter(Boolean).join(' — ')}
                            {edu.grade_or_percentage ? ` • Score: ${edu.grade_or_percentage}` : ''}
                          </span>
                          {edu.certifications && (
                            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#A5B4FC' }}>
                              🏅 Certifications: {edu.certifications}
                            </div>
                          )}
                          {edu.description && <p className="family-item-desc">{edu.description}</p>}
                        </div>
                      </div>
                      <div className="family-card-actions">
                        <button className="btn-card-icon danger" onClick={() => handleDeleteEducation(edu.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAREER */}
          {activeTab === 'career' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <Briefcase size={18} color="#818CF8" />
                  Career, Employment & Projects
                </h3>
                <button
                  className="btn-primary-glow"
                  onClick={() => {
                    setSubModalType('career');
                    setIsSubModalOpen(true);
                  }}
                >
                  <Plus size={15} />
                  <span>Add Career Record</span>
                </button>
              </div>

              {(!memberDetail.careers || memberDetail.careers.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  No career or employment history added yet for {memberDetail.full_name}.
                </div>
              ) : (
                <div className="family-items-list">
                  {memberDetail.careers.map(car => (
                    <div key={car.id} className="family-item-card">
                      <div className="family-item-main">
                        <div className="family-item-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34D399' }}>
                          <Briefcase size={22} />
                        </div>
                        <div className="family-item-content">
                          <h4 className="family-item-title">{car.role}</h4>
                          <span className="family-item-sub">{car.company} • {car.employment_type || 'Full-time'}</span>
                          <span className="family-item-dates">
                            {[car.start_date, car.end_date || (car.is_current ? 'Present' : '')].filter(Boolean).join(' — ')}
                            {car.experience_years ? ` • ${car.experience_years}` : ''}
                          </span>
                          {car.skills && (
                            <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {car.skills.split(',').map((sk, idx) => (
                                <span key={idx} style={{
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: '#A5B4FC',
                                  fontSize: '0.72rem',
                                  fontWeight: 500
                                }}>
                                  {sk.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          {car.projects && (
                            <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <strong>Projects:</strong> {car.projects}
                            </div>
                          )}
                          {car.previous_employment && (
                            <div style={{ marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <strong>Previous:</strong> {car.previous_employment}
                            </div>
                          )}
                          {car.description && <p className="family-item-desc">{car.description}</p>}
                        </div>
                      </div>
                      <div className="family-card-actions">
                        <button className="btn-card-icon danger" onClick={() => handleDeleteCareer(car.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFESSIONAL LINKS */}
          {activeTab === 'links' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <ExternalLink size={18} color="#818CF8" />
                  Professional Links & Profiles
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>LinkedIn Profile URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://linkedin.com/in/username"
                      defaultValue={memberDetail.linkedin || ''}
                      onBlur={e => handleSaveInlineText('linkedin', e.target.value)}
                    />
                    {memberDetail.linkedin && (
                      <a href={memberDetail.linkedin} target="_blank" rel="noreferrer" className="btn-card-icon" title="Open Link">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Personal Portfolio / Website</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://portfolio-or-website.com"
                      defaultValue={memberDetail.portfolio || ''}
                      onBlur={e => handleSaveInlineText('portfolio', e.target.value)}
                    />
                    {memberDetail.portfolio && (
                      <a href={memberDetail.portfolio} target="_blank" rel="noreferrer" className="btn-card-icon" title="Open Link">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Other Web Profiles / Custom Links</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="GitHub, ResearchGate, Twitter/X, Behance or personal blogs..."
                    defaultValue={memberDetail.other_links || ''}
                    onBlur={e => handleSaveInlineText('other_links', e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-saves when you click outside the box</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS VAULT */}
          {activeTab === 'documents' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <FileText size={18} color="#818CF8" />
                  Secure Documents & Records Vault
                </h3>
                <button
                  className="btn-primary-glow"
                  onClick={() => {
                    setSubModalType('document');
                    setIsSubModalOpen(true);
                  }}
                >
                  <Plus size={15} />
                  <span>Upload Document</span>
                </button>
              </div>

              {(!memberDetail.documents || memberDetail.documents.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  No documents or records uploaded yet. Securely store Passports, IDs, Certificates, or Resumes.
                </div>
              ) : (
                <div className="profile-docs-grid">
                  {memberDetail.documents.map(doc => {
                    const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf') || doc.file_url?.includes('application/pdf');
                    const isImg = doc.file_url?.startsWith('data:image') || /\.(png|jpe?g|webp|svg|gif)$/i.test(doc.file_name || '');
                    return (
                      <div
                        key={doc.id}
                        className="premium-doc-card"
                        onClick={() => setViewingDocument(doc)}
                        title="Click anywhere on card to preview document"
                      >
                        {/* Top Bar: Category Pill + Action Buttons */}
                        <div className="doc-card-top">
                          <span className="doc-card-category-badge">
                            {doc.document_type || 'Document'}
                          </span>
                          <div className="doc-card-actions-bar" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="doc-card-action-btn view-btn"
                              onClick={(e) => { e.stopPropagation(); setViewingDocument(doc); }}
                              title="Preview Document"
                            >
                              <Eye size={13} />
                              <span>Preview</span>
                            </button>
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                download={doc.file_name}
                                className="doc-card-action-btn"
                                title="Download Document"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="doc-card-action-btn danger"
                              onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Main Section: Icon + Full Document Name */}
                        <div className="doc-card-main">
                          <div className={`doc-card-icon-box ${isPdf ? 'pdf' : isImg ? 'image' : 'other'}`}>
                            {isPdf ? (
                              <>
                                <FileText size={20} />
                                <span className="doc-card-icon-tag">PDF</span>
                              </>
                            ) : isImg ? (
                              <>
                                <ImageIcon size={20} />
                                <span className="doc-card-icon-tag">IMG</span>
                              </>
                            ) : (
                              <>
                                <FileText size={20} />
                                <span className="doc-card-icon-tag">DOC</span>
                              </>
                            )}
                          </div>

                          <div className="doc-card-text-col">
                            <h4 className="doc-card-heading" title={doc.file_name}>
                              {doc.file_name}
                            </h4>
                            {doc.description && (
                              <p className="doc-card-desc-text" title={doc.description}>
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom Bar: Metadata & Quick Click Hint */}
                        <div className="doc-card-bottom-bar">
                          <div className="doc-card-meta-tags">
                            <span className="doc-card-file-size">{doc.file_size || 'Attached'}</span>
                            <span>•</span>
                            <span>{doc.upload_date || 'Recently'}</span>
                            {doc.expiry_date && (
                              <span className="doc-card-expiry-tag">
                                <Calendar size={11} /> Exp: {doc.expiry_date}
                              </span>
                            )}
                          </div>
                          <span className="doc-card-quick-hint">
                            <Eye size={12} /> Click to open
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: IMPORTANT INFORMATION & PREFERENCES */}
          {activeTab === 'info' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <Info size={18} color="#818CF8" />
                  Important Information & Preferences
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Important Notes & Vital Info</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Medical alerts, allergies, blood group, vital personal dates, important reminders..."
                    defaultValue={memberDetail.important_notes || ''}
                    onBlur={e => handleSaveInlineText('important_notes', e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-saves when you click outside the box</span>
                </div>

                <div className="form-group">
                  <label>Personal Preferences & Habits</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Food preferences, lifestyle habits, favorite activities, hobbies..."
                    defaultValue={memberDetail.preferences || ''}
                    onBlur={e => handleSaveInlineText('preferences', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Other User-Defined Information</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Any custom attributes, account handles, insurance details, or records..."
                    defaultValue={memberDetail.custom_info || ''}
                    onBlur={e => handleSaveInlineText('custom_info', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EMERGENCY DETAILS */}
          {activeTab === 'emergency' && (
            <div className="family-section-card emergency-accent-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <Heart size={18} color="#EF4444" />
                  Primary Emergency Contact
                </h3>
                <button
                  className="btn-card-view"
                  onClick={() => {
                    setEditingMemberData(memberDetail);
                    setIsAddEditModalOpen(true);
                  }}
                >
                  <Edit3 size={14} />
                  <span>Update Emergency Contact</span>
                </button>
              </div>

              <div className="family-info-grid">
                <div className="family-info-field">
                  <span className="family-info-label">Contact Person Name</span>
                  <span className="family-info-val" style={{ fontWeight: 700 }}>
                    {memberDetail.emergency_contact_name || 'Not configured'}
                  </span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Relationship to Member</span>
                  <span className="family-info-val">
                    {memberDetail.emergency_relationship || '—'}
                  </span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Emergency Phone</span>
                  <span className="family-info-val">
                    {memberDetail.emergency_phone ? (
                      <a href={`tel:${memberDetail.emergency_phone}`} style={{ color: '#F87171', fontWeight: 700, textDecoration: 'none' }}>
                        📞 {memberDetail.emergency_phone}
                      </a>
                    ) : '—'}
                  </span>
                </div>

                <div className="family-info-field">
                  <span className="family-info-label">Emergency Email</span>
                  <span className="family-info-val">
                    {memberDetail.emergency_email ? (
                      <a href={`mailto:${memberDetail.emergency_email}`} style={{ color: '#F87171', textDecoration: 'none' }}>
                        ✉️ {memberDetail.emergency_email}
                      </a>
                    ) : '—'}
                  </span>
                </div>
              </div>

              {/* Additional Emergency / Important Contacts Sub-List */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={15} color="#818CF8" />
                    Additional Emergency / Care Contacts
                  </h4>
                  <button
                    className="btn-card-view"
                    onClick={() => {
                      setSubModalType('contact');
                      setIsSubModalOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Contact</span>
                  </button>
                </div>

                {(!memberDetail.contacts || memberDetail.contacts.length === 0) ? (
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>No secondary emergency contacts added.</span>
                ) : (
                  <div className="family-items-list">
                    {memberDetail.contacts.map(ct => (
                      <div key={ct.id} className="family-item-card">
                        <div className="family-item-main">
                          <div className="family-item-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#F87171' }}>
                            <Phone size={20} />
                          </div>
                          <div className="family-item-content">
                            <h4 className="family-item-title">{ct.contact_name} {ct.relationship ? `(${ct.relationship})` : ''}</h4>
                            <span className="family-item-sub">
                              {ct.phone && <a href={`tel:${ct.phone}`} style={{ color: 'inherit' }}>{ct.phone}</a>}
                              {ct.email && ` • ${ct.email}`}
                            </span>
                            {ct.notes && <p className="family-item-desc">{ct.notes}</p>}
                          </div>
                        </div>
                        <div className="family-card-actions">
                          <button className="btn-card-icon danger" onClick={() => handleDeleteContact(ct.id)} title="Delete Contact">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: ADDITIONAL NOTES */}
          {activeTab === 'notes' && (
            <div className="family-section-card">
              <div className="family-section-header">
                <h3 className="family-section-title">
                  <Edit3 size={18} color="#818CF8" />
                  Personal Notes & Journal Vault
                </h3>
              </div>

              <div className="form-group">
                <label>Personal notes specific to {memberDetail.full_name}</label>
                <textarea
                  className="form-input"
                  rows={8}
                  placeholder="Record confidential thoughts, milestones, memories, travel plans, or personal notes here..."
                  defaultValue={memberDetail.additional_notes || ''}
                  onBlur={e => handleSaveInlineText('additional_notes', e.target.value)}
                  style={{ lineHeight: 1.6 }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Changes are automatically saved to your private zero-trust PostgreSQL vault.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modals for Editing Member and Sub-items */}
        <AddEditMemberModal
          isOpen={isAddEditModalOpen}
          onClose={() => {
            setIsAddEditModalOpen(false);
            setEditingMemberData(null);
          }}
          onSave={handleSaveMember}
          initialData={editingMemberData}
        />

        <FamilySubModal
          isOpen={isSubModalOpen}
          onClose={() => {
            setIsSubModalOpen(false);
            setSubModalType(null);
          }}
          onSave={handleSaveSubItem}
          type={subModalType}
          memberName={memberDetail.full_name}
        />

        {/* Document Viewer / Lightbox Modal */}
        <DocumentViewerModal
          isOpen={!!viewingDocument}
          document={viewingDocument}
          documents={memberDetail.documents || []}
          onSelectDocument={setViewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      </div>
    );
  }

  // ==========================================================================
  // RENDER: MEMBER DIRECTORY (MEMBER LIST)
  // ==========================================================================
  return (
    <div className="family-view-container animate-fade-in-up">
      {/* Status Toast */}
      {statusMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: statusMsg.isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#FFFFFF',
          padding: '0.65rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {statusMsg.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="family-header">
        <div className="family-title-group">
          <h1>
            <Users size={26} color="#818CF8" />
            Family Members Vault
          </h1>
          <p>
            Create and maintain independent, detailed profiles, education, career, documents, and emergency records for each family member.
          </p>
        </div>

        <div className="family-header-actions">
          <button
            className="btn-primary-glow"
            onClick={() => {
              setEditingMemberData(null);
              setIsAddEditModalOpen(true);
            }}
          >
            <UserPlus size={16} />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* Search & Relationship Filter Bar */}
      <div className="family-controls-bar">
        <div className="family-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search member by name, relationship, or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="family-rel-pills">
          {['All', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister'].map(rel => (
            <button
              key={rel}
              className={`rel-filter-pill ${filterRel === rel ? 'active' : ''}`}
              onClick={() => setFilterRel(rel)}
            >
              {rel}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading family members from encrypted database...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="family-empty-state">
          <div className="family-empty-icon-wrap">
            <Users size={36} />
          </div>
          <h3>No Family Members Found</h3>
          <p>
            {members.length === 0
              ? 'Start organizing your family records. Add profiles, educational degrees, careers, documents, and emergency contacts in one secure operating system.'
              : 'No family members match your current search or relationship filter.'}
          </p>
          {members.length === 0 && (
            <button
              className="btn-primary-glow"
              onClick={() => {
                setEditingMemberData(null);
                setIsAddEditModalOpen(true);
              }}
            >
              <UserPlus size={16} />
              <span>Add First Family Member</span>
            </button>
          )}
        </div>
      ) : (
        <div className="family-cards-grid">
          {filteredMembers.map(m => (
            <div key={m.id} className="family-card">
              {/* Header */}
              <div className="family-card-header">
                <div className="family-avatar-wrap">
                  {m.profile_photo ? (
                    <img src={m.profile_photo} alt={m.full_name} className="family-avatar-img" />
                  ) : (
                    <div className="family-avatar-fallback">
                      {m.full_name?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                  )}
                </div>

                <div className="family-card-info">
                  <div className="family-name-row">
                    <h3 className="family-card-name" title={m.full_name}>{m.full_name}</h3>
                    <span className={getBadgeClass(m.relationship_type)}>
                      {m.relationship_type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {m.dob ? `DOB: ${m.dob}` : 'Personal Profile'}
                  </span>
                </div>
              </div>

              {/* Metadata Box */}
              <div className="family-card-meta">
                {m.phone && (
                  <div className="family-meta-item">
                    <Phone size={13} color="#818CF8" />
                    <span>{m.phone}</span>
                  </div>
                )}
                {m.email && (
                  <div className="family-meta-item">
                    <Mail size={13} color="#818CF8" />
                    <span>{m.email}</span>
                  </div>
                )}
                {(m.city || m.country) && (
                  <div className="family-meta-item">
                    <MapPin size={13} color="#818CF8" />
                    <span>{[m.city, m.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {m.emergency_phone && (
                  <div className="family-meta-item" style={{ color: '#F87171' }}>
                    <Heart size={13} color="#EF4444" />
                    <span>Emergency: {m.emergency_phone}</span>
                  </div>
                )}
              </div>

              {/* Sub-records Metrics Counter */}
              <div className="family-card-metrics">
                <div className="family-card-metric">
                  <span className="num">{m.education_count || 0}</span>
                  <span className="lbl">Education</span>
                </div>
                <div className="family-card-metric">
                  <span className="num">{m.career_count || 0}</span>
                  <span className="lbl">Career</span>
                </div>
                <div className="family-card-metric">
                  <span className="num">{m.document_count || 0}</span>
                  <span className="lbl">Documents</span>
                </div>
              </div>

              {/* Actions */}
              <div className="family-card-actions">
                <button
                  className="btn-card-view"
                  onClick={() => setSelectedMemberId(m.id)}
                >
                  <span>View Profile</span>
                  <ExternalLink size={14} />
                </button>
                <button
                  className="btn-card-icon"
                  onClick={() => {
                    setEditingMemberData(m);
                    setIsAddEditModalOpen(true);
                  }}
                  title="Edit Details"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="btn-card-icon danger"
                  onClick={() => handleDeleteMember(m.id, m.full_name)}
                  title="Delete Member"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing a member */}
      <AddEditMemberModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingMemberData(null);
        }}
        onSave={handleSaveMember}
        initialData={editingMemberData}
      />
    </div>
  );
}
