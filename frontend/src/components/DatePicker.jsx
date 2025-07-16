import React, { useState, useRef, useEffect } from "react";

const DatePicker = ({ value, onChange, filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState("");
  const popoverRef = useRef(null);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleApply = () => {
    if (filter === "weekly") {
      onChange({ startDate, endDate });
    } else if (filter === "monthly") {
      onChange(month);
    } else {
      onChange(value);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setMonth("");
    onChange(null);
    setIsOpen(false);
  };

  const getDateLabel = () => {
    if (!value) {
      if (filter === "daily") return "Today";
      if (filter === "weekly") return "This Week";
      if (filter === "monthly") return "This Month";
    }

    if (filter === "daily") {
      const date = new Date(value);
      const today = new Date();
      return date.toDateString() === today.toDateString()
        ? "Today"
        : date.toLocaleDateString();
    }

    if (filter === "weekly") {
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      const today = new Date();

      if (start <= today && end >= today) {
        return "This Week";
      }

      return `${start.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })} - ${end.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })}`;
    }

    if (filter === "monthly") {
      const date = new Date(value + "-01"); // Ensure valid date
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    return "Select Date";
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm">{getDateLabel()}</span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg p-4 z-10 space-y-3"
        >
          {filter === "daily" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Select Date
              </label>
              <input
                type="date"
                // Perbaikan di sini:
                value={
                  value ||
                  new Date().toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                }
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          )}

          {filter === "weekly" && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
            </div>
          )}

          {filter === "monthly" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Select Month
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          )}

          <div className="flex space-x-2">
            <button
              className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              onClick={handleApply}
            >
              Apply
            </button>
            <button
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
