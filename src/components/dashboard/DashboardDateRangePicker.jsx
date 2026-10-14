import React from 'react';
import { Calendar, X, ArrowRight, RotateCcw } from 'lucide-react';

export default function DashboardDateRangePicker({
  fromDate = '',
  toDate = '',
  onFromChange,
  onToChange,
  onReset
}) {
  const hasActiveFilter = Boolean(fromDate || toDate);

  const handleFromChange = (e) => {
    const val = e.target.value;
    if (toDate && val && val > toDate) {
      // If fromDate becomes greater than toDate, adjust toDate to match
      onToChange && onToChange(val);
    }
    onFromChange && onFromChange(val);
  };

  const handleToChange = (e) => {
    const val = e.target.value;
    if (fromDate && val && val < fromDate) {
      // If toDate becomes smaller than fromDate, adjust fromDate to match
      onFromChange && onFromChange(val);
    }
    onToChange && onToChange(val);
  };

  return (
    <div className="dashboard-date-range-container">
      <div className={`date-picker-group ${hasActiveFilter ? 'active-filter' : ''}`}>
        {/* Calendar Icon Indicator */}
        <div className="date-picker-icon-badge">
          <Calendar size={13} className="calendar-icon" />
        </div>

        {/* FROM DATE */}
        <div className="date-input-block">
          <span className="date-field-label">From:</span>
          <input
            type="date"
            className="date-input-native"
            value={fromDate}
            max={toDate || undefined}
            onChange={handleFromChange}
            title="Filter from date"
            aria-label="Filter from date"
          />
        </div>

        {/* Arrow Divider */}
        <span className="date-arrow-divider">
          <ArrowRight size={11} />
        </span>

        {/* TO DATE */}
        <div className="date-input-block">
          <span className="date-field-label">To:</span>
          <input
            type="date"
            className="date-input-native"
            value={toDate}
            min={fromDate || undefined}
            onChange={handleToChange}
            title="Filter to date"
            aria-label="Filter to date"
          />
        </div>

        {/* CLEAR / RESET BUTTON */}
        {hasActiveFilter && (
          <button
            type="button"
            className="date-reset-btn"
            onClick={onReset}
            title="Clear date range (show all records)"
            aria-label="Clear date filter"
          >
            <X size={13} />
            <span className="reset-label">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
