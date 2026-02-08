import React from 'react';

const FilterBar = ({ filters, activeFilter, onFilterChange }) => {
    return (
        <div className="filter-bar" style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '16px',
            marginBottom: '16px',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none',  /* IE 10+ */
        }}>
            {filters.map(filter => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    style={{
                        backgroundColor: activeFilter === filter.id ? 'var(--color-primary)' : 'var(--color-card-bg)',
                        color: activeFilter === filter.id ? '#000' : 'var(--color-text)',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s',
                        boxShadow: activeFilter === filter.id ? '0 0 10px rgba(252, 163, 17, 0.4)' : 'none'
                    }}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
