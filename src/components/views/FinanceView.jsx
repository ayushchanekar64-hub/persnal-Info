import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function FinanceView() {
  const { user, setAuthModalOpen } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    runwayMonths: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Tech & Tools');
  const [description, setDescription] = useState('');

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

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      await api.finance.createTransaction({
        type,
        amount: parseFloat(amount),
        category,
        description: description || undefined,
        date: new Date().toISOString().split('T')[0]
      });
      setAmount('');
      setDescription('');
      setShowModal(false);
      fetchFinanceData();
    } catch (err) {
      console.error('Failed to create transaction:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Personal Finance & Runway</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Cash flow, savings goals, tech investments, and financial freedom milestones.
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
          <span>Log Transaction</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="nexus-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Emergency Runway</span>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {summary.runwayMonths} Months
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Net Savings: ${summary.netSavings.toLocaleString()}
          </span>
        </div>

        <div className="nexus-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Savings Rate</span>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
            {summary.savingsRate}%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Income: ${summary.totalIncome.toLocaleString()} | Expenses: ${summary.totalExpense.toLocaleString()}
          </span>
        </div>

        <div className="nexus-card">
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
          title="No financial data linked"
          description="Log income and expense records to monitor your savings rate, runway, and cash flow."
          actionLabel="+ Log Transaction"
          onAction={() => {
            if (!user) setAuthModalOpen(true);
            else setShowModal(true);
          }}
        />
      ) : (
        <div className="nexus-card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Transactions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transactions.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon-wrapper" style={{ background: t.type === 'Income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: t.type === 'Income' ? 'var(--success-600)' : 'var(--danger-500)' }}>
                    {t.type === 'Income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.description || t.category}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t.category} • {t.date}
                    </div>
                  </div>
                </div>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.92rem', color: t.type === 'Income' ? 'var(--success-600)' : 'var(--text-primary)' }}>
                  {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Log Transaction</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateTransaction} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Transaction Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${type === 'Income' ? 'pill-success' : ''}`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => setType('Income')}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${type === 'Expense' ? 'pill-danger' : ''}`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => setType('Expense')}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="e.g. 2500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Category
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Salary, Tech & Tools, Books, Subscriptions..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Description / Note
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
