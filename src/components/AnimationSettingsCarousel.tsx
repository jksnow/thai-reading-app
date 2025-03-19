import React from "react";
import Carousel from "./Carousel";
import { useShaderSettings } from "../context/ShaderSettingsContext";

interface AnimationSetting {
  value: number;
  label: string;
}

interface AnimationSettingsCarouselProps {
  settingName: "spinRotationSpeed" | "moveSpeed" | "spinAmount";
  currentValue: number;
  onValueChange: (value: number) => void;
}

const SETTINGS_CONFIG = {
  spinRotationSpeed: {
    min: 0,
    max: 0.5,
    step: 0.1,
    label: "Spin Rotation Speed",
  },
  moveSpeed: {
    min: 0,
    max: 3.0,
    step: 0.5,
    label: "Move Speed",
  },
  spinAmount: {
    min: 0,
    max: 0.25,
    step: 0.05,
    label: "Spin Amount",
  },
};

const AnimationSettingsCarousel: React.FC<AnimationSettingsCarouselProps> = ({
  settingName,
  currentValue,
  onValueChange,
}) => {
  const { isTransitioning } = useShaderSettings();
  const config = SETTINGS_CONFIG[settingName];

  // Generate options array
  const options: AnimationSetting[] = [];
  for (let value = config.min; value <= config.max; value += config.step) {
    options.push({
      value: Number(value.toFixed(2)), // Fix floating point precision
      label: value.toFixed(2),
    });
  }

  // Find current index - during transitions, find the closest value
  const getCurrentIndex = () => {
    const exactMatch = options.findIndex(
      (option) => option.value === Number(currentValue.toFixed(2))
    );

    if (exactMatch >= 0 || !isTransitioning) {
      return exactMatch;
    }

    // During transition, find the closest value
    let closestIndex = 0;
    let minDiff = Math.abs(options[0].value - currentValue);

    options.forEach((option, index) => {
      const diff = Math.abs(option.value - currentValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const currentIndex = getCurrentIndex();

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    onValueChange(options[newIndex].value);
  };

  const handleNext = () => {
    const newIndex = Math.min(options.length - 1, currentIndex + 1);
    onValueChange(options[newIndex].value);
  };

  const renderOption = (option: AnimationSetting) => {
    return <div className="text-white text-lg font-medium">{option.label}</div>;
  };

  return (
    <div>
      <label className="block text-white font-medium mb-3 text-center">
        {config.label}
      </label>
      <Carousel
        items={options}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        onPrevious={handlePrevious}
        onNext={handleNext}
        renderItem={renderOption}
        variant="amber"
        containerClassName="bg-gray-700"
      />
    </div>
  );
};

export default AnimationSettingsCarousel;
