import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function FinanceView({ onOpenQuickAction }) {
  const { user, setAuthModalOpen } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    runwayMonths: 0
  });
  const [transactions, setTransactions] = useState([]);

  const fetchFinanceData = async () => {
    if (!user) {
      setSummary({ totalIncome: 0, totalExpense: 0, netSavings: 0, savingsRate: 0, runwayMonths: 0 });
      setTransactions([]);
      return;
    }
    try {
      const [sum, txns] = await Promise.all([
        api.finance.getSummary(),
        api.finance.listTransactions()
      ]);
      setSummary(sum);
      setTransactions(txns);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [user]);

  const handleOpenCreateFinance = (preset) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (onOpenQuickAction) {
      onOpenQuickAction('finance', preset);
    }
  };

  return (
    <div className="view-transition-container">
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Personal Capital & Runway</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Cash-flow velocity, SaaS tools overhead, savings rate, and financial runway.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenCreateFinance()}
        >
          <Plus size={16} />
          <span>Log Transaction</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="nexus-card motion-card animate-fade-in-up stagger-2">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Emergency Runway</span>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {summary.runwayMonths} Months
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Net Savings: ${summary.netSavings.toLocaleString()}
          </span>
        </div>

        <div className="nexus-card motion-card animate-fade-in-up stagger-3">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Savings Rate</span>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
            {summary.savingsRate}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Income: ${summary.totalIncome.toLocaleString()} | Expenses: ${summary.totalExpense.toLocaleString()}
          </span>
        </div>

        <div className="nexus-card motion-card animate-fade-in-up stagger-4">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Net Balance</span>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: summary.netSavings >= 0 ? 'var(--success-600)' : 'var(--danger-500)', margin: '0.25rem 0' }}>
            ${summary.netSavings.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            {transactions.length} record{transactions.length !== 1 ? 's' : ''} logged
          </span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No financial transactions logged"
          description="Log income and expense records to monitor your savings rate, runway, and cash flow."
          actionLabel="+ Log Transaction"
          presets={[
            { label: 'GitHub Copilot / Claude AI Subscription', amount: 20 },
            { label: 'Cloud Hosting / AWS Infrastructure', amount: 45 },
            { label: 'Monthly Engineering Salary', amount: 9500, type: 'Income' }
          ]}
          onAction={handleOpenCreateFinance}
        />
      ) : (
        <div className="nexus-card motion-card animate-fade-in-up stagger-5" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Transactions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transactions.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon-wrapper" style={{ background: t.type === 'Income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: t.type === 'Income' ? 'var(--success-600)' : 'var(--danger-500)' }}>
                    {t.type === 'Income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{t.description || t.category}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.date} • {t.payment_method || 'Card'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.92rem', color: t.type === 'Income' ? 'var(--success-600)' : 'var(--text-primary)' }}>
                    {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                  <span className="pill pill-muted" style={{ display: 'block', fontSize: '0.65rem', marginTop: 2 }}>{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
