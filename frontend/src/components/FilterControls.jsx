import React from 'react';

const FilterControls = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
  ];

  return (
    <div className="flex space-x-2">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            currentFilter === filter.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterControls;