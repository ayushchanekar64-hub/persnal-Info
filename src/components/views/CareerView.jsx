import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, X, Building, Calendar, CheckCircle2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CareerView() {
  const { user, setAuthModalOpen } = useAuth();
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');

  const fetchCareerData = async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    try {
      const apps = await api.career.listApplications();
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load career data:', err);
    }
  };

  useEffect(() => {
    fetchCareerData();
  }, [user]);

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!company.trim() || !role.trim()) return;

    try {
      await api.career.createApplication({
        company: company.trim(),
        role: role.trim(),
        status,
        notes: notes || undefined
      });
      setCompany('');
      setRole('');
      setNotes('');
      setShowModal(false);
      fetchCareerData();
    } catch (err) {
      console.error('Failed to create career application:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Career Engineering & Trajectory</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Professional milestones, resume proof-of-work, and engineering leadership roadmap.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!user) setAuthModalOpen(true);
            else setShowModal(true);
          }}
        >
          <Plus size={16} />
          <span>New Opportunity</span>
        </button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No career opportunities logged"
          description="Track your engineering interviews, target roles, offers, and leadership benchmarks in one place."
          actionLabel="+ New Opportunity"
          onAction={() => {
            if (!user) setAuthModalOpen(true);
            else setShowModal(true);
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app) => (
            <div key={app.id} className="nexus-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                  <Building size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{app.role}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 2 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</span>
                    <span>• Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`pill ${app.status === 'Offer' ? 'pill-success' : app.status === 'Interviewing' ? 'pill-accent' : 'pill-primary'}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Log Career Opportunity</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateApplication} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="e.g. OpenAI, Stripe, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Role / Position
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Status Stage
                </label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer Received</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Notes / Salary Benchmark
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Referral by tech lead, $220k target"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Save Opportunity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
