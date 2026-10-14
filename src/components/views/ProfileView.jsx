import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Code2,
  Link as LinkIcon,
  Heart,
  FileText,
  Phone,
  ShieldCheck,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  Mail,
  Building,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Globe,
  Lock,
  Camera,
  Users,
  Upload,
  Download,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import DocumentViewerModal from '../modals/DocumentViewerModal';
import { api } from '../../services/api';
import '../../styles/profile.css';

export default function ProfileView({ user, onOpenQuickAction, onNavigate }) {
  // Navigation tab within Profile view
  // 'basic' | 'education' | 'career' | 'skills' | 'links' | 'preferences' | 'documents' | 'contacts' | 'system'
  const [activeSection, setActiveSection] = useState('basic');

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Full Personal Database State
  const [profileData, setProfileData] = useState({
    basic: null,
    educations: [],
    certifications: [],
    experiences: [],
    career_preference: null,
    skills: [],
    links: null,
    preferences: null,
    documents: [],
    contacts: [],
    system_profile: {},
    completion_score: 0,
    section_completion: {}
  });

  // Edit Mode states for single-object sections
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({});

  const [editingCareer, setEditingCareer] = useState(false);
  const [careerForm, setCareerForm] = useState({});

  const [editingLinks, setEditingLinks] = useState(false);
  const [linksForm, setLinksForm] = useState({});

  const [editingPreferences, setEditingPreferences] = useState(false);
  const [preferencesForm, setPreferencesForm] = useState({});

  // Modals for array-based items
  const [activeModal, setActiveModal] = useState(null); // 'education' | 'certification' | 'experience' | 'skill' | 'document' | 'contact'
  const [modalForm, setModalForm] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

  // -----------------------------------------------------------
  // Load Profile from Backend
  // -----------------------------------------------------------
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.profile.get();
      if (res) {
        setProfileData(res);
        setBasicForm(res.basic || {});
        setCareerForm(res.career_preference || {});
        setLinksForm(res.links || {});
        setPreferencesForm(res.preferences || {});
      }
    } catch (err) {
      console.warn('Could not load profile from backend:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._loginTs]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handleAuthChange = (e) => {
      if (e.detail?.user) {
        loadProfile();
      }
    };
    window.addEventListener('mindos:auth-change', handleAuthChange);
    return () => window.removeEventListener('mindos:auth-change', handleAuthChange);
  }, [loadProfile]);

  const showToast = (msg, type = 'success') => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // -----------------------------------------------------------
  // Handlers for Single-Object Sections
  // -----------------------------------------------------------
  const handleSaveBasic = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.profile.updateBasic(basicForm);
      setProfileData(prev => ({ ...prev, basic: res }));
      setEditingBasic(false);
      showToast('Basic profile details updated successfully');
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update basic profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCareer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.profile.updateCareer(careerForm);
      setProfileData(prev => ({ ...prev, career_preference: res }));
      setEditingCareer(false);
      showToast('Career preferences updated successfully');
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update career preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLinks = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.profile.updateLinks(linksForm);
      setProfileData(prev => ({ ...prev, links: res }));
      setEditingLinks(false);
      showToast('Professional links updated successfully');
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update professional links', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.profile.updatePreferences(preferencesForm);
      setProfileData(prev => ({ ...prev, preferences: res }));
      setEditingPreferences(false);
      showToast('Personal preferences updated successfully');
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to update preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------
  // Modal Handlers for Array-Based Records
  // -----------------------------------------------------------
  const openAddModal = (type) => {
    setActiveModal(type);
    setEditingItemId(null);
    if (type === 'document') {
      setModalForm({
        document_type: 'ID Document',
        file_name: '',
        file_size: '',
        file_url: null,
        description: '',
        expiry_date: ''
      });
    } else {
      setModalForm({});
    }
  };

  const handleDocumentFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalForm(prev => ({
          ...prev,
          file_name: prev.file_name || file.name,
          file_size: sizeStr,
          file_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (type, item) => {
    setActiveModal(type);
    setEditingItemId(item.id);
    setModalForm({ ...item });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeModal === 'education') {
        if (editingItemId) {
          await api.profile.updateEducation(editingItemId, modalForm);
          showToast('Education record updated');
        } else {
          await api.profile.createEducation(modalForm);
          showToast('Education record added');
        }
      } else if (activeModal === 'certification') {
        if (editingItemId) {
          await api.profile.updateCertification(editingItemId, modalForm);
          showToast('Certification updated');
        } else {
          await api.profile.createCertification(modalForm);
          showToast('Certification added');
        }
      } else if (activeModal === 'experience') {
        if (editingItemId) {
          await api.profile.updateExperience(editingItemId, modalForm);
          showToast('Work experience updated');
        } else {
          await api.profile.createExperience(modalForm);
          showToast('Work experience added');
        }
      } else if (activeModal === 'skill') {
        if (editingItemId) {
          await api.profile.updateSkill(editingItemId, modalForm);
          showToast('Skill updated');
        } else {
          await api.profile.createSkill(modalForm);
          showToast('Skill added');
        }
      } else if (activeModal === 'document') {
        if (editingItemId) {
          await api.profile.updateDocument(editingItemId, modalForm);
          showToast('Document updated');
        } else {
          await api.profile.createDocument(modalForm);
          showToast('Document stored in vault');
        }
      } else if (activeModal === 'contact') {
        if (editingItemId) {
          await api.profile.updateContact(editingItemId, modalForm);
          showToast('Contact updated');
        } else {
          await api.profile.createContact(modalForm);
          showToast('Contact saved');
        }
      }
      setActiveModal(null);
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete item handler
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      if (type === 'education') await api.profile.deleteEducation(id);
      else if (type === 'certification') await api.profile.deleteCertification(id);
      else if (type === 'experience') await api.profile.deleteExperience(id);
      else if (type === 'skill') await api.profile.deleteSkill(id);
      else if (type === 'document') await api.profile.deleteDocument(id);
      else if (type === 'contact') await api.profile.deleteContact(id);
      showToast('Record deleted successfully');
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  const b = profileData.basic || {};
  const cp = profileData.career_preference || {};
  const links = profileData.links || {};
  const pref = profileData.preferences || {};
  const sys = profileData.system_profile || {};

  const displayName = b.full_name || user?.name || user?.email?.split('@')[0] || 'Member';
  const displayRole = cp.current_role || b.bio || user?.role || 'Personal Workspace';
  const displayLocation = [b.city, b.country].filter(Boolean).join(', ') || 'Global';

  return (
    <div className="profile-page-wrapper">
      {/* Toast Banner */}
      {statusMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 99999,
            padding: '0.85rem 1.35rem',
            background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease forwards'
          }}
        >
          {statusMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* =======================================================
          1. HERO HEADER PROFILE CARD
         ======================================================= */}
      <section className="profile-hero-card">
        <div className="profile-hero-glow-layer" />

        <div className="profile-hero-left">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-ring">
              {b.profile_photo ? (
                <img src={b.profile_photo} alt={displayName} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-initials">
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Change Photo Overlay */}
            <div
              className="profile-avatar-edit-overlay"
              onClick={() => {
                setActiveSection('basic');
                setEditingBasic(true);
              }}
              title="Edit Profile Details & Photo"
            >
              <Camera size={18} />
            </div>

            {/* Active Status Pulse */}
            <div className="profile-avatar-status-pill" title="MIND OS Node Active">
              <span className="profile-avatar-status-dot" />
            </div>
          </div>

          <div className="profile-hero-details">
            <div className="profile-hero-name-row">
              <h1 className="profile-hero-name">{displayName}</h1>
              <span className="profile-badge-pro">
                <Sparkles size={11} /> PRO OWNER
              </span>
              <span className="profile-badge-verified">
                <ShieldCheck size={11} /> Zero-Trust Vault
              </span>
            </div>

            <div className="profile-hero-headline">
              {b.bio ? b.bio.slice(0, 100) + (b.bio.length > 100 ? '...' : '') : (cp.current_role || 'Autonomous Systems & Personal Intelligence Workspace')}
            </div>

            <div className="profile-hero-meta-row">
              <span className="profile-hero-meta-chip">
                <Mail size={13} />
                <span>{b.primary_email || user?.email || 'user@mindos.ai'}</span>
              </span>
              <span className="profile-hero-meta-chip">
                <Globe size={13} />
                <span>{displayLocation}</span>
              </span>
              <span className="profile-hero-meta-chip secure">
                <Lock size={12} />
                <span>256-bit Encrypted</span>
              </span>
            </div>
          </div>
        </div>

        <div className="profile-hero-right">
          <div className="profile-completion-meter-box">
            <div className="profile-completion-label-row">
              <span className="completion-title">
                <Sparkles size={13} className="sparkle-icon" /> Profile Strength
              </span>
              <span className="profile-completion-pct">{profileData.completion_score}%</span>
            </div>

            <div className="profile-progress-track">
              <div
                className="profile-progress-bar"
                style={{ width: `${Math.max(6, profileData.completion_score)}%` }}
              />
            </div>

            <div className="profile-completion-hint">
              {profileData.completion_score >= 80 ? (
                <span className="hint-success">✦ Excellent profile integrity & AI telemetry</span>
              ) : (
                <button
                  type="button"
                  className="hint-action-chip"
                  onClick={() => {
                    setActiveSection('basic');
                    setEditingBasic(true);
                  }}
                >
                  ⚡ Complete Bio & Identity (+25%)
                </button>
              )}
            </div>
          </div>

          <div className="profile-hero-actions">
            <button
              type="button"
              className="profile-btn-hero-primary"
              onClick={() => {
                setActiveSection('basic');
                setEditingBasic(true);
              }}
            >
              <Edit3 size={14} />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              className="profile-btn-hero-secondary"
              onClick={loadProfile}
              title="Sync profile data"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
            {onNavigate && (
              <button
                type="button"
                className="profile-btn-hero-secondary"
                onClick={() => onNavigate('family')}
                title="Manage Family Members Vault"
                style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.35)', color: '#A5B4FC' }}
              >
                <Users size={14} />
                <span>Family Vault</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =======================================================
          2. NAVIGATION TABS FOR 9 SECTIONS
         ======================================================= */}
      <nav className="profile-nav-tabs-bar">
        {[
          { id: 'basic', label: 'Basic Info', icon: User, key: 'basic' },
          { id: 'education', label: 'Education', icon: GraduationCap, key: 'education' },
          { id: 'career', label: 'Experience & Roles', icon: Briefcase, key: 'career' },
          { id: 'skills', label: 'Skills Matrix', icon: Code2, key: 'skills' },
          { id: 'links', label: 'Web & Social', icon: LinkIcon, key: 'links' },
          { id: 'preferences', label: 'Preferences', icon: Heart, key: 'preferences' },
          { id: 'documents', label: 'Document Vault', icon: FileText, key: 'documents' },
          { id: 'contacts', label: 'Contacts', icon: Phone, key: 'contacts' },
          { id: 'system', label: 'Security & System', icon: ShieldCheck, key: null }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const score = tab.key ? profileData.section_completion?.[tab.key] : null;
          const isComplete = score && score >= 70;
          return (
            <button
              key={tab.id}
              type="button"
              className={`profile-tab-btn ${activeSection === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.id)}
            >
              <TabIcon size={15} />
              <span>{tab.label}</span>
              {score !== null && (
                <div
                  className={`profile-tab-status-dot ${isComplete ? 'complete' : ''}`}
                  title={isComplete ? 'Section complete' : `Section ${score}% filled`}
                >
                  {isComplete ? '✓' : ''}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* =======================================================
          3. SECTION BODY
         ======================================================= */}
      <div className="profile-section-container">
        {/* ==========================================
            SECTION 1: BASIC PROFILE DOSSIER
           ========================================== */}
        {activeSection === 'basic' && (
          <div className="profile-dossier-wrapper">
            {/* Header / Action Bar */}
            <div className="profile-card profile-dossier-header-card">
              <div className="profile-card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="profile-card-title-group">
                  <div className="profile-card-icon-pill">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="profile-card-title">Identity & Core Dossier</h3>
                    <p className="profile-card-subtitle">Verified personal credentials, demographics, and AI executive briefing</p>
                  </div>
                </div>

                {!editingBasic ? (
                  <button
                    type="button"
                    className="profile-btn-primary"
                    onClick={() => {
                      setBasicForm(profileData.basic || {});
                      setEditingBasic(true);
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Basic Details</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="profile-btn-secondary"
                      onClick={() => setEditingBasic(false)}
                      disabled={saving}
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="button"
                      className="profile-btn-primary"
                      onClick={handleSaveBasic}
                      disabled={saving}
                    >
                      <Check size={14} />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editingBasic ? (
              <div className="profile-card">
                <form onSubmit={handleSaveBasic} className="profile-grid-2">
                  <div className="profile-field-group">
                    <label className="profile-field-label">Full Name</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Ayush Chanekar"
                      value={basicForm.full_name || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, full_name: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Primary Email</label>
                    <input
                      type="email"
                      className="profile-input-control"
                      placeholder="name@example.com"
                      value={basicForm.primary_email || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, primary_email: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Date of Birth</label>
                    <input
                      type="date"
                      className="profile-input-control"
                      value={basicForm.dob || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, dob: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Gender</label>
                    <select
                      className="profile-input-control"
                      value={basicForm.gender || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Phone Number</label>
                    <input
                      type="tel"
                      className="profile-input-control"
                      placeholder="+91 98765 43210"
                      value={basicForm.phone_number || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, phone_number: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Alternate Email</label>
                    <input
                      type="email"
                      className="profile-input-control"
                      placeholder="backup@example.com"
                      value={basicForm.alternate_email || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, alternate_email: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="profile-field-label">Street Address</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. High Street, Sector 4"
                      value={basicForm.address || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, address: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">City</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Mumbai"
                      value={basicForm.city || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, city: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">State / Province</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Maharashtra"
                      value={basicForm.state || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, state: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Country</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. India"
                      value={basicForm.country || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, country: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">PIN / ZIP Code</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. 400001"
                      value={basicForm.zip_code || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, zip_code: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="profile-field-label">Executive Bio / Professional Statement</label>
                    <textarea
                      className="profile-textarea-control"
                      placeholder="Brief summary of your background, engineering passions, and current focus..."
                      value={basicForm.bio || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                    />
                  </div>
                </form>
              </div>
            ) : (
              <div className="profile-dossier-grid">
                {/* 1. Identity & Credentials Card */}
                <div className="profile-card profile-dossier-sub-card">
                  <div className="dossier-subcard-header">
                    <span className="dossier-badge-number">01</span>
                    <div>
                      <h4 className="dossier-subcard-title">Identity & Contacts</h4>
                      <p className="dossier-subcard-desc">Verified communication endpoints</p>
                    </div>
                  </div>

                  <div className="dossier-cells-stack">
                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><User size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Full Name</span>
                        {b.full_name ? (
                          <span className="dossier-cell-text">{b.full_name}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Add full name
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><Mail size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Primary Email</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span className="dossier-cell-text">{b.primary_email || user?.email || 'ayushchanekar64@gmail.com'}</span>
                          <span className="dossier-status-pill verified">✓ Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><Phone size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Phone Number</span>
                        {b.phone_number ? (
                          <span className="dossier-cell-text">{b.phone_number}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Add phone number
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><Mail size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Alternate Email</span>
                        {b.alternate_email ? (
                          <span className="dossier-cell-text">{b.alternate_email}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Add backup email
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Geography & Demographics Card */}
                <div className="profile-card profile-dossier-sub-card">
                  <div className="dossier-subcard-header">
                    <span className="dossier-badge-number">02</span>
                    <div>
                      <h4 className="dossier-subcard-title">Geography & Demographics</h4>
                      <p className="dossier-subcard-desc">Regional localization parameters</p>
                    </div>
                  </div>

                  <div className="dossier-cells-stack">
                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><MapPin size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Location / Region</span>
                        {b.city || b.country ? (
                          <span className="dossier-cell-text">{[b.city, b.state, b.country].filter(Boolean).join(', ')}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Add location
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><Globe size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Postal / ZIP Code</span>
                        {b.zip_code ? (
                          <span className="dossier-cell-text">{b.zip_code}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Add postal code
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><Calendar size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Date of Birth</span>
                        {b.dob ? (
                          <span className="dossier-cell-text">{b.dob}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Add date of birth
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="dossier-cell-item">
                      <div className="dossier-cell-icon-wrap"><User size={15} /></div>
                      <div className="dossier-cell-body">
                        <span className="dossier-cell-tag">Gender Identity</span>
                        {b.gender ? (
                          <span className="dossier-cell-text">{b.gender}</span>
                        ) : (
                          <button
                            type="button"
                            className="dossier-empty-action"
                            onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                          >
                            + Specify gender
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Executive Statement & Bio (Full-width card) */}
                <div className="profile-card profile-dossier-bio-card">
                  <div className="dossier-subcard-header">
                    <span className="dossier-badge-number">03</span>
                    <div>
                      <h4 className="dossier-subcard-title">Executive Biography & Persona</h4>
                      <p className="dossier-subcard-desc">Context provided to local AI agents and autonomous reasoning loops</p>
                    </div>
                  </div>

                  <div className="dossier-bio-wrapper">
                    {b.bio ? (
                      <blockquote className="dossier-quote">
                        "{b.bio}"
                      </blockquote>
                    ) : (
                      <div className="dossier-empty-bio-box">
                        <p className="dossier-empty-bio-text">
                          No personal introduction configured yet. Adding your biography allows MIND OS to personalize intelligent briefings, code styling preferences, and priority workflows.
                        </p>
                        <button
                          type="button"
                          className="dossier-empty-action highlight"
                          onClick={() => { setBasicForm(profileData.basic || {}); setEditingBasic(true); }}
                        >
                          + Write your professional bio
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            SECTION 2: EDUCATION & CERTIFICATIONS
           ========================================== */}
        {activeSection === 'education' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Education Sub-card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-title-group">
                  <div className="profile-card-icon-pill">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3 className="profile-card-title">Education History</h3>
                    <p className="profile-card-subtitle">Universities, colleges, degrees, and academic milestones</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={() => openAddModal('education')}
                >
                  <Plus size={14} />
                  <span>Add Education</span>
                </button>
              </div>

              {profileData.educations.length === 0 ? (
                <div className="profile-empty-state">
                  <div className="profile-empty-icon"><GraduationCap size={24} /></div>
                  <div>No education records registered yet.</div>
                  <button type="button" className="profile-btn-secondary" onClick={() => openAddModal('education')}>
                    <Plus size={14} /> Add your first degree
                  </button>
                </div>
              ) : (
                <div className="profile-items-list">
                  {profileData.educations.map((edu) => (
                    <div key={edu.id} className="profile-item-entry-card">
                      <div className="profile-item-main">
                        <div className="profile-item-icon-box">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div className="profile-item-heading">{edu.institution}</div>
                          <div className="profile-item-subheading">
                            {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                          </div>
                          <div className="profile-item-meta">
                            <span>📅 {edu.start_date || 'Start'} — {edu.is_current ? 'Present' : (edu.end_date || 'End')}</span>
                            {edu.grade_or_gpa && <span>🎯 GPA/Score: {edu.grade_or_gpa}</span>}
                            {edu.result_status && <span>🏆 {edu.result_status}</span>}
                          </div>
                          {edu.description && <div className="profile-item-desc">{edu.description}</div>}
                        </div>
                      </div>

                      <div className="profile-item-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => openEditModal('education', edu)}
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteItem('education', edu.id)}
                          title="Delete"
                          style={{ color: '#F87171' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications Sub-card */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-title-group">
                  <div className="profile-card-icon-pill">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="profile-card-title">Professional Certifications</h3>
                    <p className="profile-card-subtitle">Verified licenses, cloud credentials, and accredited certificates</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={() => openAddModal('certification')}
                >
                  <Plus size={14} />
                  <span>Add Certification</span>
                </button>
              </div>

              {profileData.certifications.length === 0 ? (
                <div className="profile-empty-state">
                  <div className="profile-empty-icon"><Award size={24} /></div>
                  <div>No certifications added yet.</div>
                  <button type="button" className="profile-btn-secondary" onClick={() => openAddModal('certification')}>
                    <Plus size={14} /> Add your certifications
                  </button>
                </div>
              ) : (
                <div className="profile-items-list">
                  {profileData.certifications.map((cert) => (
                    <div key={cert.id} className="profile-item-entry-card">
                      <div className="profile-item-main">
                        <div className="profile-item-icon-box">
                          <Award size={20} />
                        </div>
                        <div>
                          <div className="profile-item-heading">{cert.name}</div>
                          <div className="profile-item-subheading">{cert.issuing_organization}</div>
                          <div className="profile-item-meta">
                            {cert.issue_date && <span>Issued: {cert.issue_date}</span>}
                            {cert.expiry_date && <span>Expires: {cert.expiry_date}</span>}
                            {cert.credential_id && <span>ID: {cert.credential_id}</span>}
                            {cert.credential_url && (
                              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" style={{ color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                View Credential <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="profile-item-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => openEditModal('certification', cert)}
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteItem('certification', cert.id)}
                          title="Delete"
                          style={{ color: '#F87171' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            SECTION 3: CAREER & EXPERIENCE
           ========================================== */}
        {activeSection === 'career' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Career Targets & Preferences */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-title-group">
                  <div className="profile-card-icon-pill">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h3 className="profile-card-title">Career Targets & Professional Profile</h3>
                    <p className="profile-card-subtitle">Role aspirations, compensation targets, and executive summary</p>
                  </div>
                </div>

                {!editingCareer ? (
                  <button
                    type="button"
                    className="profile-btn-primary"
                    onClick={() => {
                      setCareerForm(profileData.career_preference || {});
                      setEditingCareer(true);
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Career Target</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="profile-btn-secondary" onClick={() => setEditingCareer(false)}>
                      <X size={14} /> Cancel
                    </button>
                    <button type="button" className="profile-btn-primary" onClick={handleSaveCareer} disabled={saving}>
                      <Check size={14} /> {saving ? 'Saving...' : 'Save Targets'}
                    </button>
                  </div>
                )}
              </div>

              {editingCareer ? (
                <form onSubmit={handleSaveCareer} className="profile-grid-2">
                  <div className="profile-field-group">
                    <label className="profile-field-label">Current Role / Title</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Senior Software Engineer"
                      value={careerForm.current_role || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, current_role: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Current Company / Organization</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Acme Corp"
                      value={careerForm.current_company || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, current_company: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Target Role</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Staff Engineer / Tech Lead"
                      value={careerForm.target_role || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, target_role: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Target Companies</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Google, Stripe, Anthropic"
                      value={careerForm.target_companies || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, target_companies: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Years of Experience</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. 5+ Years"
                      value={careerForm.years_of_experience || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, years_of_experience: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Expected Compensation</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. $180,000 - $220,000"
                      value={careerForm.expected_salary || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, expected_salary: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="profile-field-label">Professional Summary</label>
                    <textarea
                      className="profile-textarea-control"
                      placeholder="Executive summary of your technical leadership and impact..."
                      value={careerForm.professional_summary || ''}
                      onChange={(e) => setCareerForm({ ...careerForm, professional_summary: e.target.value })}
                    />
                  </div>
                </form>
              ) : (
                <div className="profile-grid-3">
                  <div className="profile-field-group">
                    <span className="profile-field-label">Current Role</span>
                    <span className={`profile-field-value ${!cp.current_role ? 'empty' : ''}`}>{cp.current_role || 'Not specified'}</span>
                  </div>
                  <div className="profile-field-group">
                    <span className="profile-field-label">Current Company</span>
                    <span className={`profile-field-value ${!cp.current_company ? 'empty' : ''}`}>{cp.current_company || 'Not specified'}</span>
                  </div>
                  <div className="profile-field-group">
                    <span className="profile-field-label">Years of Experience</span>
                    <span className={`profile-field-value ${!cp.years_of_experience ? 'empty' : ''}`}>{cp.years_of_experience || 'Not specified'}</span>
                  </div>

                  <div className="profile-field-group">
                    <span className="profile-field-label">Target Role</span>
                    <span className={`profile-field-value ${!cp.target_role ? 'empty' : ''}`}>{cp.target_role || 'Not specified'}</span>
                  </div>
                  <div className="profile-field-group">
                    <span className="profile-field-label">Target Companies</span>
                    <span className={`profile-field-value ${!cp.target_companies ? 'empty' : ''}`}>{cp.target_companies || 'Not specified'}</span>
                  </div>
                  <div className="profile-field-group">
                    <span className="profile-field-label">Expected Salary</span>
                    <span className={`profile-field-value ${!cp.expected_salary ? 'empty' : ''}`}>{cp.expected_salary || 'Not specified'}</span>
                  </div>

                  <div className="profile-field-group" style={{ gridColumn: 'span 3' }}>
                    <span className="profile-field-label">Professional Summary</span>
                    <span className={`profile-field-value ${!cp.professional_summary ? 'empty' : ''}`} style={{ lineHeight: 1.6 }}>
                      {cp.professional_summary || 'No professional summary provided. Click "Edit Career Target" to add one.'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Work Experiences List */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-title-group">
                  <div className="profile-card-icon-pill">
                    <Building size={18} />
                  </div>
                  <div>
                    <h3 className="profile-card-title">Work Experience History</h3>
                    <p className="profile-card-subtitle">Employment records, responsibilities, and key achievements</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={() => openAddModal('experience')}
                >
                  <Plus size={14} />
                  <span>Add Experience</span>
                </button>
              </div>

              {profileData.experiences.length === 0 ? (
                <div className="profile-empty-state">
                  <div className="profile-empty-icon"><Briefcase size={24} /></div>
                  <div>No work experience records logged yet.</div>
                  <button type="button" className="profile-btn-secondary" onClick={() => openAddModal('experience')}>
                    <Plus size={14} /> Add your work history
                  </button>
                </div>
              ) : (
                <div className="profile-items-list">
                  {profileData.experiences.map((exp) => (
                    <div key={exp.id} className="profile-item-entry-card">
                      <div className="profile-item-main">
                        <div className="profile-item-icon-box">
                          <Building size={20} />
                        </div>
                        <div>
                          <div className="profile-item-heading">{exp.role}</div>
                          <div className="profile-item-subheading">{exp.company} • {exp.employment_type || 'Full-time'}</div>
                          <div className="profile-item-meta">
                            <span>📅 {exp.start_date || 'Start'} — {exp.is_current ? 'Present' : (exp.end_date || 'End')}</span>
                            {exp.location && <span>📍 {exp.location}</span>}
                          </div>
                          {exp.description && <div className="profile-item-desc">{exp.description}</div>}
                          {exp.responsibilities && (
                            <div className="profile-item-desc" style={{ color: '#CBD5E1' }}>
                              <strong>Key Responsibilities:</strong> {exp.responsibilities}
                            </div>
                          )}
                          {exp.achievements && (
                            <div className="profile-item-desc" style={{ color: '#A78BFA' }}>
                              <strong>Achievements:</strong> {exp.achievements}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="profile-item-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => openEditModal('experience', exp)}
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteItem('experience', exp.id)}
                          title="Delete"
                          style={{ color: '#F87171' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            SECTION 4: SKILLS INVENTORY
           ========================================== */}
        {activeSection === 'skills' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-pill">
                  <Code2 size={18} />
                </div>
                <div>
                  <h3 className="profile-card-title">Skills & Technical Inventory</h3>
                  <p className="profile-card-subtitle">Categorized skills with proficiency ratings and experience depth</p>
                </div>
              </div>

              <button
                type="button"
                className="profile-btn-primary"
                onClick={() => openAddModal('skill')}
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </button>
            </div>

            {profileData.skills.length === 0 ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon"><Code2 size={24} /></div>
                <div>No skills registered in your database.</div>
                <button type="button" className="profile-btn-secondary" onClick={() => openAddModal('skill')}>
                  <Plus size={14} /> Register your first skill
                </button>
              </div>
            ) : (
              <div className="profile-skills-grid">
                {profileData.skills.map((skill) => (
                  <div key={skill.id} className="profile-skill-card">
                    <div className="profile-skill-header">
                      <span className="profile-skill-name">{skill.name}</span>
                      <span className={`profile-skill-proficiency-badge ${(skill.proficiency || '').toLowerCase()}`}>
                        {skill.proficiency}
                      </span>
                    </div>

                    <div className="profile-skill-meta">
                      <span>🏷️ {skill.category || 'Technical'}</span>
                      <span>⏱️ {skill.years_of_experience || 1} yrs</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ padding: '0.2rem' }}
                        onClick={() => openEditModal('skill', skill)}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ padding: '0.2rem', color: '#F87171' }}
                        onClick={() => handleDeleteItem('skill', skill.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            SECTION 5: PROFESSIONAL LINKS
           ========================================== */}
        {activeSection === 'links' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-pill">
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h3 className="profile-card-title">Professional & Coding Profiles</h3>
                  <p className="profile-card-subtitle">Connect your public developer portfolios and professional links</p>
                </div>
              </div>

              {!editingLinks ? (
                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={() => {
                    setLinksForm(profileData.links || {});
                    setEditingLinks(true);
                  }}
                >
                  <Edit3 size={14} />
                  <span>Edit Links</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="profile-btn-secondary" onClick={() => setEditingLinks(false)}>
                    <X size={14} /> Cancel
                  </button>
                  <button type="button" className="profile-btn-primary" onClick={handleSaveLinks} disabled={saving}>
                    <Check size={14} /> {saving ? 'Saving...' : 'Save Links'}
                  </button>
                </div>
              )}
            </div>

            {editingLinks ? (
              <form onSubmit={handleSaveLinks} className="profile-grid-2">
                <div className="profile-field-group">
                  <label className="profile-field-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="profile-input-control"
                    placeholder="https://linkedin.com/in/username"
                    value={linksForm.linkedin || ''}
                    onChange={(e) => setLinksForm({ ...linksForm, linkedin: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">GitHub URL</label>
                  <input
                    type="url"
                    className="profile-input-control"
                    placeholder="https://github.com/username"
                    value={linksForm.github || ''}
                    onChange={(e) => setLinksForm({ ...linksForm, github: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Personal Portfolio Website</label>
                  <input
                    type="url"
                    className="profile-input-control"
                    placeholder="https://myportfolio.dev"
                    value={linksForm.portfolio || ''}
                    onChange={(e) => setLinksForm({ ...linksForm, portfolio: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">LeetCode Profile</label>
                  <input
                    type="url"
                    className="profile-input-control"
                    placeholder="https://leetcode.com/username"
                    value={linksForm.leetcode || ''}
                    onChange={(e) => setLinksForm({ ...linksForm, leetcode: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">HackerRank Profile</label>
                  <input
                    type="url"
                    className="profile-input-control"
                    placeholder="https://hackerrank.com/username"
                    value={linksForm.hackerrank || ''}
                    onChange={(e) => setLinksForm({ ...linksForm, hackerrank: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Stack Overflow Profile</label>
                  <input
                    type="url"
                    className="profile-input-control"
                    placeholder="https://stackoverflow.com/users/id"
                    value={linksForm.stackoverflow || ''}
                    onChange={(e) => setLinksForm({ ...linksForm, stackoverflow: e.target.value })}
                  />
                </div>
              </form>
            ) : (
              <div className="profile-grid-2">
                {[
                  { label: 'LinkedIn', url: links.linkedin },
                  { label: 'GitHub', url: links.github },
                  { label: 'Portfolio', url: links.portfolio },
                  { label: 'LeetCode', url: links.leetcode },
                  { label: 'HackerRank', url: links.hackerrank },
                  { label: 'Stack Overflow', url: links.stackoverflow }
                ].map((item, idx) => (
                  <div key={idx} className="profile-item-entry-card" style={{ padding: '0.85rem 1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <LinkIcon size={16} color="#A78BFA" />
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{item.label}</div>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#60A5FA', fontSize: '0.88rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {item.url} <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.88rem', fontStyle: 'italic' }}>Not connected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            SECTION 6: PERSONAL PREFERENCES
           ========================================== */}
        {activeSection === 'preferences' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-pill">
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="profile-card-title">Personal Preferences & Work Style</h3>
                  <p className="profile-card-subtitle">Hobbies, preferred technologies, learning style, and personal goals</p>
                </div>
              </div>

              {!editingPreferences ? (
                <button
                  type="button"
                  className="profile-btn-primary"
                  onClick={() => {
                    setPreferencesForm(profileData.preferences || {});
                    setEditingPreferences(true);
                  }}
                >
                  <Edit3 size={14} />
                  <span>Edit Preferences</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="profile-btn-secondary" onClick={() => setEditingPreferences(false)}>
                    <X size={14} /> Cancel
                  </button>
                  <button type="button" className="profile-btn-primary" onClick={handleSavePreferences} disabled={saving}>
                    <Check size={14} /> {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}
            </div>

            {editingPreferences ? (
              <form onSubmit={handleSavePreferences} className="profile-grid-2">
                <div className="profile-field-group">
                  <label className="profile-field-label">Interests & Hobbies</label>
                  <input
                    type="text"
                    className="profile-input-control"
                    placeholder="e.g. Open Source, Distributed Systems, Cycling, Chess"
                    value={preferencesForm.interests || ''}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, interests: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Favorite Technologies & Frameworks</label>
                  <input
                    type="text"
                    className="profile-input-control"
                    placeholder="e.g. React, Next.js, FastAPI, PostgreSQL, PyTorch"
                    value={preferencesForm.favorite_technologies || ''}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, favorite_technologies: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Favorite Programming Languages</label>
                  <input
                    type="text"
                    className="profile-input-control"
                    placeholder="e.g. TypeScript, Python, Rust, Go"
                    value={preferencesForm.favorite_languages || ''}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, favorite_languages: e.target.value })}
                  />
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Preferred Work Environment</label>
                  <input
                    type="text"
                    className="profile-input-control"
                    placeholder="e.g. Remote-first, High autonomy, Asynchronous communication"
                    value={preferencesForm.preferred_work_environment || ''}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, preferred_work_environment: e.target.value })}
                  />
                </div>

                <div className="profile-field-group" style={{ gridColumn: 'span 2' }}>
                  <label className="profile-field-label">Long-Term Goals & Aspirations</label>
                  <textarea
                    className="profile-textarea-control"
                    placeholder="What are your big audacious goals for the next 1-3 years?"
                    value={preferencesForm.goals_aspirations || ''}
                    onChange={(e) => setPreferencesForm({ ...preferencesForm, goals_aspirations: e.target.value })}
                  />
                </div>
              </form>
            ) : (
              <div className="profile-grid-2">
                <div className="profile-field-group">
                  <span className="profile-field-label">Interests & Hobbies</span>
                  <span className={`profile-field-value ${!pref.interests ? 'empty' : ''}`}>{pref.interests || 'Not specified'}</span>
                </div>
                <div className="profile-field-group">
                  <span className="profile-field-label">Favorite Technologies</span>
                  <span className={`profile-field-value ${!pref.favorite_technologies ? 'empty' : ''}`}>{pref.favorite_technologies || 'Not specified'}</span>
                </div>
                <div className="profile-field-group">
                  <span className="profile-field-label">Favorite Languages</span>
                  <span className={`profile-field-value ${!pref.favorite_languages ? 'empty' : ''}`}>{pref.favorite_languages || 'Not specified'}</span>
                </div>
                <div className="profile-field-group">
                  <span className="profile-field-label">Work Environment</span>
                  <span className={`profile-field-value ${!pref.preferred_work_environment ? 'empty' : ''}`}>{pref.preferred_work_environment || 'Not specified'}</span>
                </div>
                <div className="profile-field-group" style={{ gridColumn: 'span 2' }}>
                  <span className="profile-field-label">Goals & Aspirations</span>
                  <span className={`profile-field-value ${!pref.goals_aspirations ? 'empty' : ''}`} style={{ lineHeight: 1.6 }}>
                    {pref.goals_aspirations || 'No long-term aspirations entered yet.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            SECTION 7: DOCUMENTS VAULT
           ========================================== */}
        {activeSection === 'documents' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-pill">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="profile-card-title">Secure Document Vault</h3>
                  <p className="profile-card-subtitle">Resumes, verified IDs, academic transcripts, and offer letters</p>
                </div>
              </div>

              <button
                type="button"
                className="profile-btn-primary"
                onClick={() => openAddModal('document')}
              >
                <Plus size={14} />
                <span>Upload Document Record</span>
              </button>
            </div>

            {profileData.documents.length === 0 ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon"><FileText size={24} /></div>
                <div>No documents cataloged in your vault.</div>
                <button type="button" className="profile-btn-secondary" onClick={() => openAddModal('document')}>
                  <Plus size={14} /> Catalog your first document
                </button>
              </div>
            ) : (
              <div className="profile-docs-grid">
                {profileData.documents.map((doc) => {
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
                              title="Download original file"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download size={13} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="doc-card-action-btn"
                            onClick={(e) => { e.stopPropagation(); openEditModal('document', doc); }}
                            title="Edit details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="doc-card-action-btn danger"
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem('document', doc.id); }}
                            title="Delete document"
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

        {/* ==========================================
            SECTION 8: IMPORTANT CONTACTS
           ========================================== */}
        {activeSection === 'contacts' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-pill">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="profile-card-title">Important & Emergency Contacts</h3>
                  <p className="profile-card-subtitle">Key personnel, family, mentors, and emergency reachability records</p>
                </div>
              </div>

              <button
                type="button"
                className="profile-btn-primary"
                onClick={() => openAddModal('contact')}
              >
                <Plus size={14} />
                <span>Add Contact</span>
              </button>
            </div>

            {profileData.contacts.length === 0 ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon"><Phone size={24} /></div>
                <div>No emergency or important contacts saved yet.</div>
                <button type="button" className="profile-btn-secondary" onClick={() => openAddModal('contact')}>
                  <Plus size={14} /> Add an important contact
                </button>
              </div>
            ) : (
              <div className="profile-grid-2">
                {profileData.contacts.map((contact) => (
                  <div key={contact.id} className="profile-item-entry-card">
                    <div className="profile-item-main">
                      <div className="profile-item-icon-box">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="profile-item-heading">{contact.full_name}</div>
                        <div className="profile-item-subheading">{contact.relationship_type || 'Contact'}</div>
                        <div className="profile-item-meta">
                          {contact.phone && <span>📞 {contact.phone}</span>}
                          {contact.email && <span>✉️ {contact.email}</span>}
                        </div>
                        {contact.notes && <div className="profile-item-desc">{contact.notes}</div>}
                      </div>
                    </div>

                    <div className="profile-item-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => openEditModal('contact', contact)}
                        title="Edit"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleDeleteItem('contact', contact.id)}
                        title="Delete"
                        style={{ color: '#F87171' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            SECTION 9: SYSTEM METADATA
           ========================================== */}
        {activeSection === 'system' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-pill">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="profile-card-title">System & Security Metadata</h3>
                  <p className="profile-card-subtitle">Immutable database telemetry and zero-trust account properties</p>
                </div>
              </div>
            </div>

            <div className="profile-grid-3">
              <div className="profile-field-group">
                <span className="profile-field-label">User ID (Database Key)</span>
                <span className="profile-field-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {sys.user_id || user?.id || '—'}
                </span>
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">Username</span>
                <span className="profile-field-value">{sys.username || user?.email?.split('@')[0] || '—'}</span>
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">Account Primary Email</span>
                <span className="profile-field-value">{sys.account_email || user?.email || '—'}</span>
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">Account Created At</span>
                <span className="profile-field-value">{sys.account_created ? new Date(sys.account_created).toLocaleDateString() : 'Active'}</span>
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">Last Database Sync</span>
                <span className="profile-field-value">{new Date().toLocaleTimeString()}</span>
              </div>

              <div className="profile-field-group">
                <span className="profile-field-label">Zero-Trust Authorization Status</span>
                <span className="profile-field-value" style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={15} /> Encrypted & Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          4. UNIVERSAL RECORD MODAL (Create/Edit)
         ======================================================= */}
      {activeModal && createPortal(
        <div className="profile-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="profile-modal-card animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <h3 className="profile-modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {activeModal === 'document'
                    ? (editingItemId ? 'Edit Document' : 'Upload Document to Vault')
                    : `${editingItemId ? 'Edit' : 'Add'} ${
                        activeModal === 'education' ? 'Education Record' :
                        activeModal === 'certification' ? 'Certification' :
                        activeModal === 'experience' ? 'Work Experience' :
                        activeModal === 'skill' ? 'Skill' : 'Contact'
                      }`}
                </h3>
                {activeModal === 'document' && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    For {profileData?.basic?.full_name || user?.name || 'Ayush Chanekar'}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setActiveModal(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Education Form */}
              {activeModal === 'education' && (
                <>
                  <div className="profile-field-group">
                    <label className="profile-field-label">College / University</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Stanford University"
                      value={modalForm.institution || ''}
                      onChange={(e) => setModalForm({ ...modalForm, institution: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Degree</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Bachelor of Science in Computer Science"
                      value={modalForm.degree || ''}
                      onChange={(e) => setModalForm({ ...modalForm, degree: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Branch / Specialization</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Artificial Intelligence & Systems"
                      value={modalForm.field_of_study || ''}
                      onChange={(e) => setModalForm({ ...modalForm, field_of_study: e.target.value })}
                    />
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Start Date</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. Aug 2020"
                        value={modalForm.start_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, start_date: e.target.value })}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label className="profile-field-label">End Date</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. May 2024"
                        disabled={modalForm.is_current}
                        value={modalForm.end_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="current_edu_toggle"
                      checked={Boolean(modalForm.is_current)}
                      onChange={(e) => setModalForm({ ...modalForm, is_current: e.target.checked })}
                    />
                    <label htmlFor="current_edu_toggle" style={{ fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                      I am currently studying here
                    </label>
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">CGPA / Percentage</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. 3.92 / 4.0 or 92%"
                        value={modalForm.grade_or_gpa || ''}
                        onChange={(e) => setModalForm({ ...modalForm, grade_or_gpa: e.target.value })}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label className="profile-field-label">Grade / Distinction</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. Summa Cum Laude"
                        value={modalForm.result_status || ''}
                        onChange={(e) => setModalForm({ ...modalForm, result_status: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Certification Form */}
              {activeModal === 'certification' && (
                <>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Certification Name</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Issuing Organization</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Amazon Web Services"
                      value={modalForm.issuing_organization || ''}
                      onChange={(e) => setModalForm({ ...modalForm, issuing_organization: e.target.value })}
                    />
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Issue Date</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. Jan 2025"
                        value={modalForm.issue_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, issue_date: e.target.value })}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label className="profile-field-label">Expiry Date</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. Jan 2028"
                        value={modalForm.expiry_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Credential ID</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. AWS-PSA-948102"
                      value={modalForm.credential_id || ''}
                      onChange={(e) => setModalForm({ ...modalForm, credential_id: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Credential Verification URL</label>
                    <input
                      type="url"
                      className="profile-input-control"
                      placeholder="https://credly.com/..."
                      value={modalForm.credential_url || ''}
                      onChange={(e) => setModalForm({ ...modalForm, credential_url: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Experience Form */}
              {activeModal === 'experience' && (
                <>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Role / Job Title</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Senior Software Engineer"
                      value={modalForm.role || ''}
                      onChange={(e) => setModalForm({ ...modalForm, role: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Company Name</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Stripe"
                      value={modalForm.company || ''}
                      onChange={(e) => setModalForm({ ...modalForm, company: e.target.value })}
                    />
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Employment Type</label>
                      <select
                        className="profile-input-control"
                        value={modalForm.employment_type || 'Full-time'}
                        onChange={(e) => setModalForm({ ...modalForm, employment_type: e.target.value })}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                        <option value="Founder / Self-employed">Founder / Self-employed</option>
                      </select>
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Location</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. San Francisco, CA / Remote"
                        value={modalForm.location || ''}
                        onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Start Date</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. March 2022"
                        value={modalForm.start_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, start_date: e.target.value })}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label className="profile-field-label">End Date</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. Present"
                        disabled={modalForm.is_current}
                        value={modalForm.end_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="current_job_toggle"
                      checked={Boolean(modalForm.is_current)}
                      onChange={(e) => setModalForm({ ...modalForm, is_current: e.target.checked })}
                    />
                    <label htmlFor="current_job_toggle" style={{ fontSize: '0.85rem', color: '#CBD5E1', cursor: 'pointer' }}>
                      I am currently working in this role
                    </label>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Responsibilities & Scope</label>
                    <textarea
                      className="profile-textarea-control"
                      placeholder="Summary of responsibilities and technologies used..."
                      value={modalForm.responsibilities || ''}
                      onChange={(e) => setModalForm({ ...modalForm, responsibilities: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Key Achievements</label>
                    <textarea
                      className="profile-textarea-control"
                      placeholder="Impact, metrics, and notable accomplishments..."
                      value={modalForm.achievements || ''}
                      onChange={(e) => setModalForm({ ...modalForm, achievements: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Skill Form */}
              {activeModal === 'skill' && (
                <>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Skill Name</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. TypeScript, React, System Design"
                      value={modalForm.name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    />
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Category</label>
                      <select
                        className="profile-input-control"
                        value={modalForm.category || 'Technical'}
                        onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Languages">Languages</option>
                        <option value="Frameworks">Frameworks</option>
                        <option value="Cloud / DevOps">Cloud / DevOps</option>
                        <option value="Tools">Tools</option>
                        <option value="Soft Skills">Soft Skills</option>
                      </select>
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Proficiency Level</label>
                      <select
                        className="profile-input-control"
                        value={modalForm.proficiency || 'Intermediate'}
                        onChange={(e) => setModalForm({ ...modalForm, proficiency: e.target.value })}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Years of Experience</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      className="profile-input-control"
                      placeholder="e.g. 3.5"
                      value={modalForm.years_of_experience || ''}
                      onChange={(e) => setModalForm({ ...modalForm, years_of_experience: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </>
              )}

              {/* Document Form */}
              {activeModal === 'document' && (
                <>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Document Title *</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Passport, Degree Certificate, Resume"
                      value={modalForm.file_name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, file_name: e.target.value })}
                    />
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Document Category</label>
                      <select
                        className="profile-input-control"
                        value={modalForm.document_type || 'ID Document'}
                        onChange={(e) => setModalForm({ ...modalForm, document_type: e.target.value })}
                      >
                        <option value="ID Document">ID Document (Passport, Aadhaar, SSN)</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Resume">Resume / CV</option>
                        <option value="Academic">Academic Transcript</option>
                        <option value="Important File">Important File</option>
                        <option value="Other">Other Document</option>
                      </select>
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Expiry Date (If applicable)</label>
                      <input
                        type="date"
                        className="profile-input-control"
                        value={modalForm.expiry_date || ''}
                        onChange={(e) => setModalForm({ ...modalForm, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Upload File (or paste link)</label>
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 0.95rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}>
                        <Upload size={14} />
                        <span>Choose File</span>
                        <input type="file" onChange={handleDocumentFileUpload} style={{ display: 'none' }} />
                      </label>
                      <span style={{ fontSize: '0.8rem', color: modalForm.file_size ? '#A78BFA' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {modalForm.file_size ? `${modalForm.file_name || 'Attached File'} (${modalForm.file_size})` : 'PDF, JPG, PNG or DOC'}
                      </span>
                    </div>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Description / Notes</label>
                    <input
                      type="text"
                      className="profile-input-control"
                      placeholder="e.g. Valid until 2030, official copy"
                      value={modalForm.description || ''}
                      onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Contact Form */}
              {activeModal === 'contact' && (
                <>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Full Name</label>
                    <input
                      type="text"
                      required
                      className="profile-input-control"
                      placeholder="e.g. Dr. Robert Chen"
                      value={modalForm.full_name || ''}
                      onChange={(e) => setModalForm({ ...modalForm, full_name: e.target.value })}
                    />
                  </div>

                  <div className="profile-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Relationship / Role</label>
                      <input
                        type="text"
                        className="profile-input-control"
                        placeholder="e.g. Family / Mentor / Emergency"
                        value={modalForm.relationship_type || ''}
                        onChange={(e) => setModalForm({ ...modalForm, relationship_type: e.target.value })}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label className="profile-field-label">Phone Number</label>
                      <input
                        type="tel"
                        className="profile-input-control"
                        placeholder="+1 (555) 392-1029"
                        value={modalForm.phone || ''}
                        onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Email Address</label>
                    <input
                      type="email"
                      className="profile-input-control"
                      placeholder="contact@example.com"
                      value={modalForm.email || ''}
                      onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    />
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Address / Reachability Notes</label>
                    <textarea
                      className="profile-textarea-control"
                      placeholder="Address or contact notes..."
                      value={modalForm.notes || ''}
                      onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="profile-modal-footer" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  className="profile-btn-secondary"
                  style={{ borderRadius: '9999px', padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-btn-primary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                  }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingItemId ? 'Save Changes' : 'Add Record')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Document Viewer / Lightbox Modal */}
      <DocumentViewerModal
        isOpen={!!viewingDocument}
        document={viewingDocument}
        documents={profileData.documents}
        onSelectDocument={setViewingDocument}
        onClose={() => setViewingDocument(null)}
      />
    </div>
  );
}
