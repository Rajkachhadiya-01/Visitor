import React, { useState, useEffect, useMemo, useRef } from 'react';

const FilterDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Type to search...',
  noDataText = 'No matches',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(o =>
      String(o.label).toLowerCase().includes(q) ||
      String(o.value).toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered.length]);

  const currentLabel = options.find(o => o.value === value)?.label || '';

  return (
    <div className="relative" ref={ref}>
      <div
        className="w-full px-4 py-3 border rounded-lg bg-white flex items-center justify-between cursor-text"
        onClick={() => setOpen(true)}
      >
        <input
          value={open ? query : currentLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered[highlight]) {
                onChange(filtered[highlight].value);
                setQuery('');
                setOpen(false);
              }
            } else if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
          }}
          placeholder={placeholder}
          className="flex-1 focus:outline-none bg-transparent"
        />
        <span className="ml-2 text-gray-400">▾</span>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">{noDataText}</div>
          ) : (
            filtered.map((o, idx) => (
              <button
                key={o.value}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                  idx === highlight ? 'bg-indigo-50' : ''
                }`}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => {
                  onChange(o.value);
                  setQuery('');
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;