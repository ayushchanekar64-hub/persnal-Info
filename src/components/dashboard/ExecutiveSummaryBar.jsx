import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Share2,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import DashboardDateRangePicker from './DashboardDateRangePicker';

export default function ExecutiveSummaryBar({
  user,
  stats = {},
  fromDate = '',
  toDate = '',
  onFromChange,
  onToChange,
  onResetDateRange,
  onOpenQuickAction
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Month list from January to Current Month dynamically
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0 to 11

  // Dynamically slice up to current month (e.g. Jan..Sep)
  const monthOptions = allMonths.slice(0, currentMonthIdx + 1).map((name, index) => {
    const monthNum = String(index + 1).padStart(2, '0');
    return {
      label: name,
      shortLabel: name.slice(0, 3),
      yearMonth: `${currentYear}-${monthNum}`,
      index,
      isCurrent: index === currentMonthIdx
    };
  });

  const [selectedMonth, setSelectedMonth] = useState('All Months');

  // Sync selectedMonth label when fromDate & toDate change
  useEffect(() => {
    if (!fromDate && !toDate) {
      setSelectedMonth('All Months');
      return;
    }
    const matched = monthOptions.find(m => {
      const [yStr, mStr] = m.yearMonth.split('-');
      const y = parseInt(yStr, 10);
      const mon = parseInt(mStr, 10);
      const lastDay = new Date(y, mon, 0).getDate();
      const expectedFrom = `${yStr}-${mStr}-01`;
      const expectedTo = `${yStr}-${mStr}-${String(lastDay).padStart(2, '0')}`;
      return fromDate === expectedFrom && toDate === expectedTo;
    });

    if (matched) {
      setSelectedMonth(matched.label);
    } else {
      setSelectedMonth('Custom Range');
    }
  }, [fromDate, toDate]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSelectMonthOption = (monthObj) => {
    if (!monthObj) {
      // All Months (Reset filter)
      setSelectedMonth('All Months');
      onResetDateRange && onResetDateRange();
      setDropdownOpen(false);
      return;
    }

    const [yearStr, monthStr] = monthObj.yearMonth.split('-');
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const lastDay = new Date(y, m, 0).getDate();

    const newFrom = `${yearStr}-${monthStr}-01`;
    const newTo = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    onFromChange && onFromChange(newFrom);
    onToChange && onToChange(newTo);
    setSelectedMonth(monthObj.label);
    setDropdownOpen(false);
  };

  return (
    <div className="dashboard-reference-header animate-fade-in-up stagger-1">
      {/* Left: Big bold title */}
      <div className="dashboard-header-title-col">
        <h1 className="dashboard-hero-title">Dashboard</h1>
      </div>

      {/* Middle: Compact Date Pickers (From Date & To Date) */}
      <DashboardDateRangePicker
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={onFromChange}
        onToChange={onToChange}
        onReset={onResetDateRange}
      />

      {/* Right: Controls (Month Dropdown + Share + Filter + Action Pill) */}
      <div className="dashboard-header-controls-row">
        {/* Dynamic Month Dropdown */}
        <div className="timeframe-dropdown-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="timeframe-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Filter dashboard by month"
            aria-label="Filter dashboard by month"
          >
            <Calendar size={14} className="timeframe-icon" />
            <span style={{ fontWeight: 600 }}>{selectedMonth}</span>
            <ChevronDown size={13} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="nexus-card timeframe-popover animate-pop-in">
              {/* All Months Option */}
              <button
                type="button"
                className={`timeframe-opt-btn ${selectedMonth === 'All Months' ? 'active' : ''}`}
                onClick={() => handleSelectMonthOption(null)}
              >
                <span>All Months (YTD)</span>
                {selectedMonth === 'All Months' && <Check size={12} className="opt-check-icon" />}
              </button>

              <div className="dropdown-divider-line" />

              {/* Dynamic Months from January to Current Month */}
              {monthOptions.map((m) => {
                const isActive = selectedMonth === m.label;
                return (
                  <button
                    key={m.yearMonth}
                    type="button"
                    className={`timeframe-opt-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectMonthOption(m)}
                  >
                    <span>{m.label}</span>
                    {m.isCurrent && <span className="month-current-badge">Current</span>}
                    {isActive && <Check size={12} className="opt-check-icon" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Share / Export Icon */}
        <button className="btn-icon round-control-icon" title="Share Workspace Telemetry">
          <Share2 size={15} />
        </button>

        {/* Filter / Sliders Icon */}
        <button className="btn-icon round-control-icon" title="Customize Widgets">
          <SlidersHorizontal size={15} />
        </button>

        {/* Primary Action Button (+ Quick Action / AI Assistant) */}
        <button
          className="btn-ai-assistant-pill hero-action"
          onClick={() => onOpenQuickAction && onOpenQuickAction('task')}
        >
          <Sparkles size={14} />
          <span>+ Quick Action</span>
        </button>
      </div>
    </div>
  );
}
