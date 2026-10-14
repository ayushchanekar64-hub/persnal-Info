import React, { useState } from 'react';
import { X, Upload, FileText, Briefcase, GraduationCap, Phone, AlertCircle } from 'lucide-react';

export default function FamilySubModal({ isOpen, onClose, onSave, type, memberName }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          file_name: prev.file_name || file.name,
          file_size: sizeStr,
          file_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const renderTitle = () => {
    switch (type) {
      case 'education': return 'Add Education Record';
      case 'career': return 'Add Career Experience / Project';
      case 'document': return 'Upload Document to Vault';
      case 'contact': return 'Add Important / Emergency Contact';
      default: return 'Add Record';
    }
  };

  return (
    <div className="family-modal-overlay" onClick={onClose}>
      <div className="family-modal-box" onClick={e => e.stopPropagation()}>
        <div className="family-modal-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <h3>{renderTitle()}</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>For {memberName}</span>
          </div>
          <button className="btn-card-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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

            {/* EDUCATION TYPE */}
            {type === 'education' && (
              <>
                <div className="form-group">
                  <label>Institution / School / University *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Stanford University or Delhi Public School"
                    value={formData.institution || ''}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Degree / Qualification *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. B.Tech / High School"
                      value={formData.degree || ''}
                      onChange={e => setFormData({ ...formData, degree: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch / Specialization</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Computer Science"
                      value={formData.field_of_study || ''}
                      onChange={e => setFormData({ ...formData, field_of_study: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Start Date / Year</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Aug 2020"
                      value={formData.start_date || ''}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date / Year</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. May 2024"
                      value={formData.end_date || ''}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>CGPA / Percentage / Grade</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 8.9 CGPA or 92%"
                    value={formData.grade_or_percentage || ''}
                    onChange={e => setFormData({ ...formData, grade_or_percentage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Certifications Earned</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AWS Certified, First Aid, Python Mastery"
                    value={formData.certifications || ''}
                    onChange={e => setFormData({ ...formData, certifications: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* CAREER TYPE */}
            {type === 'career' && (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Company / Organization *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Google / Self-Employed"
                      value={formData.company || ''}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role / Designation *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Architect / Teacher"
                      value={formData.role || ''}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Employment Type</label>
                    <select
                      className="form-input"
                      value={formData.employment_type || 'Full-time'}
                      onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Total Experience</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 5 Years"
                      value={formData.experience_years || ''}
                      onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills & Technologies</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Python, Leadership, Financial Planning"
                    value={formData.skills || ''}
                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Previous Employment Summary</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ex-Microsoft (2 yrs), Ex-Infosys"
                    value={formData.previous_employment || ''}
                    onChange={e => setFormData({ ...formData, previous_employment: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Key Projects & Achievements</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe major initiatives, systems built, or awards..."
                    value={formData.projects || ''}
                    onChange={e => setFormData({ ...formData, projects: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* DOCUMENT TYPE */}
            {type === 'document' && (
              <>
                <div className="form-group">
                  <label>Document Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Passport, Degree Certificate, Resume"
                    value={formData.file_name || ''}
                    onChange={e => setFormData({ ...formData, file_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Document Category</label>
                    <select
                      className="form-input"
                      value={formData.document_type || 'ID Document'}
                      onChange={e => setFormData({ ...formData, document_type: e.target.value })}
                    >
                      <option value="ID Document">ID Document (Passport, Aadhaar, SSN)</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Resume">Resume / CV</option>
                      <option value="Academic">Academic Transcript</option>
                      <option value="Important File">Important File</option>
                      <option value="Other">Other Document</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Expiry Date (If applicable)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expiry_date || ''}
                      onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Upload File (or paste link)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.95rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      flexShrink: 0
                    }}>
                      <Upload size={14} />
                      <span>Choose File</span>
                      <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formData.file_size ? `${formData.file_name} (${formData.file_size})` : 'PDF, JPG, PNG or DOC'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Valid until 2030, official copy"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* CONTACT TYPE */}
            {type === 'contact' && (
              <>
                <div className="form-group">
                  <label>Contact Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Robert Chen or Office HR"
                    value={formData.contact_name || ''}
                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Relationship / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Family Doctor, Guardian, Lawyer"
                      value={formData.relationship || ''}
                      onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contact@domain.com"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Notes / Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Call only during business hours"
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="family-modal-footer">
            <button type="button" className="btn-back-directory" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-glow" disabled={saving}>
              {saving ? 'Saving...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
