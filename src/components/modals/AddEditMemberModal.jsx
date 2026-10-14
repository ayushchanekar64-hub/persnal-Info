import React, { useState, useEffect } from 'react';
import { X, Upload, User, Heart, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

const RELATIONSHIP_OPTIONS = [
  'Father',
  'Mother',
  'Spouse',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Uncle',
  'Aunt',
  'Cousin',
  'Guardian',
  'Other'
];

export default function AddEditMemberModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    full_name: '',
    relationship_type: 'Father',
    profile_photo: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    bio: '',
    emergency_contact_name: '',
    emergency_relationship: '',
    emergency_phone: '',
    emergency_email: '',
    linkedin: '',
    portfolio: '',
    other_links: '',
    important_notes: '',
    preferences: '',
    additional_notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        relationship_type: initialData.relationship_type || 'Father',
        profile_photo: initialData.profile_photo || '',
        dob: initialData.dob || '',
        gender: initialData.gender || 'Male',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        zip_code: initialData.zip_code || '',
        bio: initialData.bio || '',
        emergency_contact_name: initialData.emergency_contact_name || '',
        emergency_relationship: initialData.emergency_relationship || '',
        emergency_phone: initialData.emergency_phone || '',
        emergency_email: initialData.emergency_email || '',
        linkedin: initialData.linkedin || '',
        portfolio: initialData.portfolio || '',
        other_links: initialData.other_links || '',
        important_notes: initialData.important_notes || '',
        preferences: initialData.preferences || '',
        additional_notes: initialData.additional_notes || ''
      });
    } else {
      setFormData({
        full_name: '',
        relationship_type: 'Father',
        profile_photo: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        bio: '',
        emergency_contact_name: '',
        emergency_relationship: '',
        emergency_phone: '',
        emergency_email: '',
        linkedin: '',
        portfolio: '',
        other_links: '',
        important_notes: '',
        preferences: '',
        additional_notes: ''
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError('Full Name is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save family member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="family-modal-overlay" onClick={onClose}>
      <div className="family-modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="family-modal-header">
          <h3>{initialData ? 'Edit Family Member' : 'Add Family Member'}</h3>
          <button className="btn-card-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="family-modal-body">
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Photo Upload & Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#1E2028',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {formData.profile_photo ? (
                  <img src={formData.profile_photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={32} color="#818CF8" />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  width: 'fit-content'
                }}>
                  <Upload size={14} />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>JPG, PNG or WEBP up to 2MB</span>
              </div>
            </div>

            {/* Name & Relationship */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Eleanor Vance"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Relationship *</label>
                <select
                  className="form-input"
                  value={formData.relationship_type}
                  onChange={e => setFormData({ ...formData, relationship_type: e.target.value })}
                >
                  {RELATIONSHIP_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ background: '#1A1B20', color: '#FFF' }}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male" style={{ background: '#1A1B20' }}>Male</option>
                  <option value="Female" style={{ background: '#1A1B20' }}>Female</option>
                  <option value="Other" style={{ background: '#1A1B20' }}>Other</option>
                  <option value="Prefer not to say" style={{ background: '#1A1B20' }}>Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label>Residential Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, apartment or suite"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Emergency Details Highlight */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={14} />
                Emergency Contact For This Member
              </span>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Emergency Contact Person</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contact Name"
                    value={formData.emergency_contact_name}
                    onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Emergency Phone"
                    value={formData.emergency_phone}
                    onChange={e => setFormData({ ...formData, emergency_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label>Bio / Overview</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Brief summary or personal description..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="family-modal-footer">
            <button
              type="button"
              className="btn-back-directory"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-glow"
              disabled={saving}
            >
              {saving ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
