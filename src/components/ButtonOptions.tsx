import React, { ReactNode } from "react";

interface ButtonOptionsProps {
  children: ReactNode;
  variant?: "blue" | "green" | "amber" | "red" | "purple";
  backgroundColor?: string;
  fontSize?: string;
  padding?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ButtonOptions: React.FC<ButtonOptionsProps> = ({
  children,
  variant = "blue",
  backgroundColor = "bg-gray-800",
  fontSize = "text-lg",
  padding = "py-4",
  onClick,
  disabled = false,
}) => {
  // Get variant-specific color
  const getVariantColor = () => {
    // If backgroundColor is provided, use that instead of variant
    if (backgroundColor !== "bg-gray-800") {
      return backgroundColor;
    }

    // Otherwise use variant colors
    switch (variant) {
      case "blue":
        return "bg-blue-700 hover:bg-blue-900";
      case "green":
        return "bg-green-700 hover:bg-green-900";
      case "amber":
        return "bg-amber-700 hover:bg-amber-900";
      case "red":
        return "bg-red-600 hover:bg-red-700";
      case "purple":
        return "bg-purple-700 hover:bg-purple-800";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const buttonStyles = `
    ${getVariantColor()}
    ${fontSize}
    ${padding}
    px-6
    font-bold
    rounded-lg
    text-white
    transition-colors
    w-full
    focus:outline-none
    focus:ring-0
    focus:border-transparent
    active:outline-none
    active:border-transparent
    app-button-reset
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `;

  // Button content with onClick handler
  const buttonContent = (
    <button
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      style={{
        boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)",
        textShadow: "0px 2px 0px rgba(0,0,0,1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );

  // Just return the button in a div
  return <div className="flex-1">{buttonContent}</div>;
};

export default ButtonOptions;
