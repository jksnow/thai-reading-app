import React from "react";

interface LogoProps {
  size?: number;
}

export const ThaiTaleLogo: React.FC<LogoProps> = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className="fill-current"
  >
    {/* Open Book Background */}
    <path
      d="M10,30 Q10,20 20,20 L50,15 L80,20 Q90,20 90,30 V75 Q90,80 80,80 L50,85 L20,80 Q10,80 10,75 Z"
      fill="#F8F1E9" /* offwhite */
      stroke="#264653" /* charcoal */
      strokeWidth="2"
    />

    {/* Book Pages - Left Side */}
    <path
      d="M15,30 Q15,25 20,25 L48,20 V77 L20,73 Q15,73 15,68 Z"
      fill="white"
      stroke="#E8E0CA"
      strokeWidth="1"
    />

    {/* Book Pages - Right Side */}
    <path
      d="M85,30 Q85,25 80,25 L52,20 V77 L80,73 Q85,73 85,68 Z"
      fill="white"
      stroke="#E8E0CA"
      strokeWidth="1"
    />

    {/* Book Binding */}
    <path
      d="M48,20 L52,20 V77 L48,77 Z"
      fill="#E76F51" /* deepred */
    />

    {/* Thai Character */}
    <text
      x="30"
      y="50"
      fontSize="20"
      fontWeight="bold"
      fill="#2A9D8F" /* teal */
    >
      ท
    </text>

    {/* Stars/Sparkles - Imagination */}
    <path
      d="M65,35 L67,40 L72,42 L67,44 L65,49 L63,44 L58,42 L63,40 Z"
      fill="#F4A261" /* saffron */
    />
    <path
      d="M75,50 L76,53 L79,54 L76,55 L75,58 L74,55 L71,54 L74,53 Z"
      fill="#F4A261" /* saffron */
    />
    <path
      d="M70,60 L71,63 L74,64 L71,65 L70,68 L69,65 L66,64 L69,63 Z"
      fill="#F4A261" /* saffron */
    />
  </svg>
);

export const ThaiTaleText: React.FC = () => (
  <h1 className="text-charcoal text-xl font-semibold">
    Thai<span className="text-teal">Tale</span>
  </h1>
);

// Fix the default export
export default ThaiTaleLogo;
