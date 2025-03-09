import React from "react";
import { Link } from "react-router-dom";

const WelcomePage: React.FC = () => {
  return (
    <div className="w-full max-w-md p-8 mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Welcome to Thai Reading
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Improve your Thai reading skills with personalized stories and
        interactive learning.
      </p>
      <div className="flex flex-col gap-4">
        <Link
          to="/login"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-center font-medium rounded-lg transition-colors"
        >
          Create Account
        </Link>
        <Link
          to="/demo"
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-center font-medium rounded-lg transition-colors"
        >
          Try Demo
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
