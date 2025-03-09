import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("beginner");

  const handleStartDemo = () => {
    // Navigate to a demo story
    navigate("/story/demo-story-1");
  };

  return (
    <div className="w-full max-w-md p-8 mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Try ThaiReader Demo
      </h1>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          This is a demo mode with limited functionality. Create an account to
          access all features.
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="level"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select your Thai language level:
        </label>
        <select
          id="level"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">
          Demo Features:
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Read a pre-generated Thai story</li>
          <li>Interactive vocabulary highlighting</li>
          <li>Word translations on hover</li>
          <li>Comprehension questions</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleStartDemo}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
        >
          Start Demo
        </button>

        <div className="text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Welcome Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
