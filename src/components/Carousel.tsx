import React from "react";
import ButtonOptions from "./ButtonOptions";

export interface CarouselProps<T> {
  items: T[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  renderItem: (item: T) => React.ReactNode;
  disabled?: boolean;
  variant?: "blue" | "green" | "amber" | "red" | "purple";
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  showDots?: boolean;
  fullWidth?: boolean;
}

const Carousel = <T,>({
  items,
  currentIndex,
  onPrevious,
  onNext,
  renderItem,
  disabled = false,
  variant = "purple",
  containerStyle = {},
  containerClassName = "bg-gray-800",
  showDots = true,
  fullWidth = true,
}: CarouselProps<T>) => {
  // Generate dots for navigation
  const renderDots = () => {
    return Array.from({ length: items.length }).map((_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full mx-1 transition-colors duration-300 ${
          index === currentIndex ? "bg-white" : "bg-gray-500"
        }`}
      />
    ));
  };

  return (
    <div
      className={`flex items-center ${fullWidth ? "w-full" : "w-auto"} gap-2`}
    >
      {/* Left arrow button */}
      <div className="flex-shrink-0">
        <ButtonOptions
          variant={variant}
          onClick={onPrevious}
          disabled={disabled}
          padding="py-3 px-3"
          fontSize="text-lg"
        >
          &lsaquo;
        </ButtonOptions>
      </div>

      {/* Content display container */}
      <div
        className={`${containerClassName} flex-1 rounded-lg py-3 text-center border-2 border-gray-300`}
        style={{
          boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)",
          ...containerStyle,
        }}
      >
        {items.length > 0 && renderItem(items[currentIndex])}
        {showDots && (
          <div className="flex justify-center mt-1">{renderDots()}</div>
        )}
      </div>

      {/* Right arrow button */}
      <div className="flex-shrink-0">
        <ButtonOptions
          variant={variant}
          onClick={onNext}
          disabled={disabled}
          padding="py-3 px-3"
          fontSize="text-lg"
        >
          &rsaquo;
        </ButtonOptions>
      </div>
    </div>
  );
};

export default Carousel;
