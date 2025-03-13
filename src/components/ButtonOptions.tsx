import React, { ReactNode } from "react";

interface ButtonOptionsProps {
  children: ReactNode;
  to?: string; // Keep for backward compatibility
  variant?: "primary" | "secondary" | "tertiary";
  backgroundColor?: string;
  fontSize?: string;
  padding?: string;
  onClick?: () => void;
}

const ButtonOptions: React.FC<ButtonOptionsProps> = ({
  children,
  to,
  variant = "primary",
  backgroundColor = "bg-gray-800",
  fontSize = "text-lg",
  padding = "py-4",
  onClick,
}) => {
  // Get variant-specific color
  const getVariantColor = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-700 hover:bg-blue-900";
      case "secondary":
        return "bg-green-700 hover:bg-green-900";
      case "tertiary":
        return "bg-amber-700 hover:bg-amber-900";
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
  `;

  // Button content with onClick handler
  const buttonContent = (
    <button
      className={buttonStyles}
      onClick={onClick}
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
