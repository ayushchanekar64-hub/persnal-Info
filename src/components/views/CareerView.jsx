import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Building, Calendar, CheckCircle2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CareerView({ onOpenQuickAction }) {
  const { user, setAuthModalOpen } = useAuth();
  const [applications, setApplications] = useState([]);

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

  const handleOpenCreateCareer = (preset) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (onOpenQuickAction) {
      onOpenQuickAction('career', preset);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer': return 'pill-success';
      case 'Final Round': case 'Technical Interview': return 'pill-accent';
      case 'Applied': return 'pill-primary';
      case 'Rejected': return 'pill-danger';
      default: return 'pill-muted';
    }
  };

  return (
    <div className="view-transition-container">
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Career Pipeline & Trajectory</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Professional milestones, interview pipeline, and engineering compensation targets.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenCreateCareer()}
        >
          <Plus size={16} />
          <span>New Opportunity</span>
        </button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No career opportunities logged"
          description="Track your engineering interviews, target roles, offers, and compensation benchmarks in one place."
          actionLabel="+ New Opportunity"
          presets={[
            { label: 'Senior Full-Stack Engineer @ Stripe' },
            { label: 'Staff Backend Engineer @ Google' },
            { label: 'Distributed Systems Architect @ OpenAI' }
          ]}
          onAction={handleOpenCreateCareer}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app, idx) => (
            <div key={app.id} className={`nexus-card motion-card animate-fade-in-up stagger-${Math.min(idx + 2, 8)}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                  <Building size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{app.role}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 2 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</span>
                    <span>•</span>
                    <span>{app.location || 'Remote'}</span>
                    {app.salary && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--success-600)', fontWeight: 600 }}>{app.salary}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`pill ${getStatusBadge(app.status)}`}>{app.status}</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
