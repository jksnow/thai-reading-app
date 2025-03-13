import React, { ReactNode } from "react";

interface ButtonContainerProps {
  children: ReactNode;
  backgroundColor?: string;
  className?: string;
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({
  children,
  backgroundColor = "bg-gray-800",
  className = "",
}) => {
  return (
    <div
      className={`${backgroundColor} p-2 rounded-xl shadow-none inline-block ${className}`}
      style={{
        boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)",
      }}
    >
      <div className="flex flex-row gap-2">{children}</div>
    </div>
  );
};

export default ButtonContainer;
