import React from "react";
import { useAppState } from "../context/AppStateContext";
import Carousel from "./Carousel";
import { BALATRO_COLOR_SCHEMES } from "../utils/colorSchemes";

const ColorSchemeCarousel: React.FC = () => {
  const { currentSchemeIndex, setColorScheme, isColorTransitioning } =
    useAppState();

  const handlePrevious = () => {
    if (isColorTransitioning) return;
    const newIndex =
      (currentSchemeIndex - 1 + BALATRO_COLOR_SCHEMES.length) %
      BALATRO_COLOR_SCHEMES.length;
    setColorScheme(newIndex);
  };

  const handleNext = () => {
    if (isColorTransitioning) return;
    const newIndex = (currentSchemeIndex + 1) % BALATRO_COLOR_SCHEMES.length;
    setColorScheme(newIndex);
  };

  const renderColorScheme = (scheme: (typeof BALATRO_COLOR_SCHEMES)[0]) => {
    return <div className="text-white text-xs">{scheme.name}</div>;
  };

  return (
    <Carousel
      items={BALATRO_COLOR_SCHEMES}
      currentIndex={currentSchemeIndex}
      onPrevious={handlePrevious}
      onNext={handleNext}
      renderItem={renderColorScheme}
      disabled={isColorTransitioning}
      variant="blue"
    />
  );
};

export default ColorSchemeCarousel;
