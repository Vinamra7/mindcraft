import React, { useState } from 'react';

const TaskSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-4">
      <button
        onClick={toggleExpand}
        className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md flex items-center justify-between"
      >
        <span>Task [optional] &nbsp;</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-2 p-4 bg-gray-800 rounded-md">
          <div className="mb-4">
            <label htmlFor="taskPath" className="block mb-2 text-sm font-medium">Task Path</label>
            <input
              type="text"
              id="taskPath"
              className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white"
              placeholder="Enter task path"
            />
          </div>
          <div>
            <label htmlFor="taskId" className="block mb-2 text-sm font-medium">Task ID</label>
            <input
              type="text"
              id="taskId"
              className="w-full px-3 py-2 border rounded-md bg-gray-700 text-white"
              placeholder="Enter task ID"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSection;
