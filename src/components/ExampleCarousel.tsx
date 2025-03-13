import React, { useState } from "react";
import Carousel from "./Carousel";

// Example items - could be any type of data
const EXAMPLE_ITEMS = [
  { id: 1, title: "First Item", description: "Description for the first item" },
  {
    id: 2,
    title: "Second Item",
    description: "Description for the second item",
  },
  { id: 3, title: "Third Item", description: "Description for the third item" },
  {
    id: 4,
    title: "Fourth Item",
    description: "Description for the fourth item",
  },
];

const ExampleCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + EXAMPLE_ITEMS.length) % EXAMPLE_ITEMS.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % EXAMPLE_ITEMS.length);
  };

  const renderItem = (item: (typeof EXAMPLE_ITEMS)[0]) => {
    return (
      <div className="p-2">
        <h3 className="text-white text-lg font-bold">{item.title}</h3>
        <p className="text-gray-300 text-sm">{item.description}</p>
      </div>
    );
  };

  return (
    <Carousel
      items={EXAMPLE_ITEMS}
      currentIndex={currentIndex}
      onPrevious={handlePrevious}
      onNext={handleNext}
      renderItem={renderItem}
      variant="green"
      containerClassName="bg-gray-700"
    />
  );
};

export default ExampleCarousel;
