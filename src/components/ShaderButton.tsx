import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { useColorTransition } from "../utils/useColorTransition";
import * as THREE from "three";

interface ShaderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  fullWidth?: boolean;
  className?: string;
}

const ShaderButton: React.FC<ShaderButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) => {
  // Access the current shader colors
  const { colorA, colorB } = useColorTransition();

  // Convert THREE.Color to CSS rgba format
  const getCssColor = (color: THREE.Color, opacity = 1) => {
    return `rgba(${Math.floor(color.r * 255)}, ${Math.floor(
      color.g * 255
    )}, ${Math.floor(color.b * 255)}, ${opacity})`;
  };

  // Generate gradient background based on variant
  const getGradientBackground = () => {
    const colorACSS = getCssColor(colorA);
    const colorBCSS = getCssColor(colorB);

    // Different gradient angles and color mixes based on variant
    switch (variant) {
      case "primary":
        return `linear-gradient(135deg, ${colorACSS} 0%, ${colorBCSS} 100%)`;
      case "secondary":
        return `linear-gradient(45deg, ${colorACSS} 0%, ${colorBCSS} 100%)`;
      case "tertiary":
        return `linear-gradient(180deg, ${colorACSS} 0%, ${colorBCSS} 100%)`;
      default:
        return `linear-gradient(135deg, ${colorACSS} 0%, ${colorBCSS} 100%)`;
    }
  };

  // Calculate luminance to determine if text should be light or dark
  const getLuminance = (color: THREE.Color) => {
    // Formula for perceived brightness
    return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  };

  // Average luminance of both colors
  const avgLuminance = (getLuminance(colorA) + getLuminance(colorB)) / 2;

  // Use white text on dark backgrounds, black text on light backgrounds
  const textColor = avgLuminance < 0.5 ? "white" : "black";

  // Base styles
  const baseStyles: React.CSSProperties = {
    background: getGradientBackground(),
    color: textColor,
    fontWeight: 500,
    borderRadius: "0.375rem",
    padding: "0.5rem 1rem",
    border: "none",
    cursor: "pointer",
    transition: "all 150ms ease",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    width: fullWidth ? "100%" : "auto",
    textShadow: avgLuminance < 0.3 ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
  };

  // Hover effect
  const hoverStyles = {
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
  };

  return (
    <button
      className={`shader-button ${className}`}
      style={baseStyles}
      onMouseOver={(e) => {
        Object.assign(e.currentTarget.style, hoverStyles);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = baseStyles.boxShadow as string;
        e.currentTarget.style.transform = "translateY(0)";
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default ShaderButton;
