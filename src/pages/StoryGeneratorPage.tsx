import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StoryGeneratorPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    vocabulary: "",
    length: "medium",
    includeQuestions: true,
  });

  // Template info based on the selected template
  const [templateInfo, setTemplateInfo] = useState({
    title: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    // Simulating fetching template details
    const fetchTemplateDetails = () => {
      // This would normally be an API call
      const templates = [
        {
          id: "1",
          title: "Daily Life Story",
          description: "A story about everyday activities and situations",
          icon: "🏠",
        },
        {
          id: "2",
          title: "Adventure Story",
          description: "An exciting journey with challenges to overcome",
          icon: "🏕️",
        },
        {
          id: "3",
          title: "Mystery Story",
          description: "Solve puzzles and uncover secrets",
          icon: "🔍",
        },
        {
          id: "4",
          title: "Fantasy Story",
          description: "Magical worlds and creatures",
          icon: "🧙",
        },
      ];

      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setTemplateInfo(template);
      } else {
        // Handle template not found
        navigate("/dashboard");
      }
    };

    fetchTemplateDetails();
  }, [templateId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Generating story with:", { templateId, ...formData });
      setIsLoading(false);
      // Navigate to the story page with a dummy story ID
      navigate("/story/demo-story-1");
    }, 2000);
  };

  return (
    <div className="relative z-10 w-full max-w-2xl p-8 mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
      <div className="flex items-center mb-6">
        <div className="text-4xl mr-3">{templateInfo.icon}</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {templateInfo.title}
          </h1>
          <p className="text-gray-600">{templateInfo.description}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Topic or Theme
          </label>
          <input
            id="topic"
            name="topic"
            type="text"
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g., Going to a restaurant, Meeting friends"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="vocabulary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Vocabulary (optional)
          </label>
          <textarea
            id="vocabulary"
            name="vocabulary"
            value={formData.vocabulary}
            onChange={handleChange}
            placeholder="Enter specific words or phrases you want included in the story"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple words or phrases with commas
          </p>
        </div>

        <div>
          <label
            htmlFor="length"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Story Length
          </label>
          <select
            id="length"
            name="length"
            value={formData.length}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="short">Short (2-3 minutes)</option>
            <option value="medium">Medium (5-7 minutes)</option>
            <option value="long">Long (10+ minutes)</option>
          </select>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="includeQuestions"
              name="includeQuestions"
              type="checkbox"
              checked={formData.includeQuestions}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="includeQuestions"
              className="font-medium text-gray-700"
            >
              Include comprehension questions
            </label>
            <p className="text-gray-500">
              Add questions at the end to test understanding
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Story..." : "Generate Story"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoryGeneratorPage;
