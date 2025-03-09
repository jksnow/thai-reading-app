import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const storyTemplates = [
    {
      id: 1,
      title: "Daily Life Story",
      description: "A story about everyday activities and situations",
      difficulty: "Beginner",
      icon: "🏠",
    },
    {
      id: 2,
      title: "Adventure Story",
      description: "An exciting journey with challenges to overcome",
      difficulty: "Intermediate",
      icon: "🏕️",
    },
    {
      id: 3,
      title: "Mystery Story",
      description: "Solve puzzles and uncover secrets",
      difficulty: "Advanced",
      icon: "🔍",
    },
    {
      id: 4,
      title: "Fantasy Story",
      description: "Magical worlds and creatures",
      difficulty: "Intermediate",
      icon: "🧙",
    },
  ];

  const handleStorySelect = (id: number) => {
    // Placeholder for actual story selection
    console.log("Selected story template:", id);
    navigate(`/story-generator/${id}`);
  };

  return (
    <div className="w-full max-w-4xl p-8 mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Choose a Story Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleStorySelect(template.id)}
              className="p-6 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors flex items-start"
            >
              <div className="text-4xl mr-4">{template.icon}</div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {template.title}
                </h3>
                <p className="text-gray-600 mb-2">{template.description}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Stories
        </h2>
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-500">You haven't created any stories yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Your recent stories will appear here.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Your Progress
        </h2>
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Vocabulary Learned
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: "25%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">25 words (25%)</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Reading Level
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: "40%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Beginner - Level 2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
