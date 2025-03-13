import React from "react";
import { StoryParams } from "../../utils/storyUtils";
import ButtonOptions from "../ButtonOptions";
import Carousel from "../Carousel";

// Constants for carousel options
const genreOptions = [
  { value: "Adventure", label: "Adventure" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Mystery", label: "Mystery" },
  { value: "Science Fiction", label: "Science Fiction" },
  { value: "Horror", label: "Horror" },
  { value: "Historical", label: "Historical" },
  { value: "Fairy Tale", label: "Fairy Tale" },
  { value: "Mythology", label: "Mythology" },
];

const ratingOptions = [
  { value: "G (Everyone)", label: "G", description: "Suitable for all ages" },
  {
    value: "PG (Parental Guidance)",
    label: "PG",
    description: "Parental guidance suggested",
  },
  {
    value: "PG-13 (Teens)",
    label: "PG-13",
    description: "Some material may be inappropriate for children",
  },
  {
    value: "R (17+)",
    label: "R",
    description: "Restricted to 17+ unless with guardian",
  },
];

const levelOptions = [
  {
    value:
      "Age 5-7 (Very basic vocabulary First 500 words you learn in school)",
    label: "Age 5-7",
    description: "Very basic vocabulary (First 500 words)",
  },
  {
    value: "Age 8-10 (Basic vocabulary, simple sentences)",
    label: "Age 8-10",
    description: "Basic vocabulary, simple sentences",
  },
  {
    value: "Age 11-12 (Moderate vocabulary, compound sentences)",
    label: "Age 11-12",
    description: "Moderate vocabulary, compound sentences",
  },
  {
    value: "Age 13-14 (Rich vocabulary, complex sentences)",
    label: "Age 13-14",
    description: "Rich vocabulary, complex sentences",
  },
  {
    value: "Age 15+ (Advanced vocabulary, complex narrative)",
    label: "Age 15+",
    description: "Advanced vocabulary, complex narrative",
  },
];

// Paragraph options for carousel
const paragraphOptions = [
  { value: 1, label: "1 Paragraph" },
  { value: 2, label: "2 Paragraphs" },
  { value: 3, label: "3 Paragraphs" },
];

interface StoryControlsProps {
  params: StoryParams;
  onParamsChange: (params: Partial<StoryParams>) => void;
  onGenerateStory: () => void;
  isGenerating: boolean;
}

const StoryControls: React.FC<StoryControlsProps> = ({
  params,
  onParamsChange,
  onGenerateStory,
  isGenerating,
}) => {
  // Find current indices for all options
  const genreIndex = genreOptions.findIndex(
    (option) => option.value === params.genre
  );

  const ratingIndex = ratingOptions.findIndex(
    (option) => option.value === params.parentalRating
  );

  const levelIndex = levelOptions.findIndex(
    (option) => option.value === params.readingLevel
  );

  const paragraphIndex = paragraphOptions.findIndex(
    (option) => option.value === params.paragraphs
  );

  // Handlers for genre carousel
  const handlePrevGenre = () => {
    const newIndex = Math.max(0, genreIndex - 1);
    onParamsChange({ genre: genreOptions[newIndex].value });
  };

  const handleNextGenre = () => {
    const newIndex = Math.min(genreOptions.length - 1, genreIndex + 1);
    onParamsChange({ genre: genreOptions[newIndex].value });
  };

  // Handlers for rating carousel
  const handlePrevRating = () => {
    const newIndex = Math.max(0, ratingIndex - 1);
    onParamsChange({ parentalRating: ratingOptions[newIndex].value });
  };

  const handleNextRating = () => {
    const newIndex = Math.min(ratingOptions.length - 1, ratingIndex + 1);
    onParamsChange({ parentalRating: ratingOptions[newIndex].value });
  };

  // Handlers for level carousel
  const handlePrevLevel = () => {
    const newIndex = Math.max(0, levelIndex - 1);
    onParamsChange({ readingLevel: levelOptions[newIndex].value });
  };

  const handleNextLevel = () => {
    const newIndex = Math.min(levelOptions.length - 1, levelIndex + 1);
    onParamsChange({ readingLevel: levelOptions[newIndex].value });
  };

  // Handlers for paragraph carousel
  const handlePrevParagraph = () => {
    const newIndex = Math.max(0, paragraphIndex - 1);
    onParamsChange({ paragraphs: paragraphOptions[newIndex].value });
  };

  const handleNextParagraph = () => {
    const newIndex = Math.min(paragraphOptions.length - 1, paragraphIndex + 1);
    onParamsChange({ paragraphs: paragraphOptions[newIndex].value });
  };

  // Render functions for carousels
  const renderGenreOption = (option: (typeof genreOptions)[0]) => {
    return <div className="text-white text-lg font-medium">{option.label}</div>;
  };

  const renderRatingOption = (option: (typeof ratingOptions)[0]) => {
    return (
      <div className="text-center">
        <div className="text-white text-lg font-bold">{option.label}</div>
        <div className="text-gray-300 text-s">{option.description}</div>
      </div>
    );
  };

  const renderLevelOption = (option: (typeof levelOptions)[0]) => {
    return (
      <div className="text-center">
        <div className="text-white text-lg font-bold">{option.label}</div>
        <div className="text-gray-300 text-s">{option.description}</div>
      </div>
    );
  };

  const renderParagraphOption = (option: (typeof paragraphOptions)[0]) => {
    return <div className="text-white text-lg font-medium">{option.label}</div>;
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <div
        className="bg-gray-800 max-w-[600px] w-full p-8 shadow-lg rounded-lg border-2 border-gray-300"
        style={{ boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)" }}
      >
        <h1 className="text-2xl font-bold text-white mb-8 font-serif text-center">
          Choose your story options
        </h1>

        <div className="space-y-8">
          {/* Genre Selection */}
          <div>
            <label className="block text-white font-medium mb-3 text-center">
              Story Genre
            </label>
            <Carousel
              items={genreOptions}
              currentIndex={genreIndex >= 0 ? genreIndex : 0}
              onPrevious={handlePrevGenre}
              onNext={handleNextGenre}
              renderItem={renderGenreOption}
              variant="amber"
              containerClassName="bg-gray-700"
            />
          </div>

          {/* Parental Rating Selection */}
          <div>
            <label className="block text-white font-medium mb-3 text-center">
              Parental Rating
            </label>
            <Carousel
              items={ratingOptions}
              currentIndex={ratingIndex >= 0 ? ratingIndex : 0}
              onPrevious={handlePrevRating}
              onNext={handleNextRating}
              renderItem={renderRatingOption}
              variant="red"
              containerClassName="bg-gray-700"
              containerStyle={{ minHeight: "70px" }}
            />
          </div>

          {/* Reading Level Selection */}
          <div>
            <label className="block text-white font-medium mb-3 text-center">
              Reading Level
            </label>
            <Carousel
              items={levelOptions}
              currentIndex={levelIndex >= 0 ? levelIndex : 0}
              onPrevious={handlePrevLevel}
              onNext={handleNextLevel}
              renderItem={renderLevelOption}
              variant="green"
              containerClassName="bg-gray-700"
              containerStyle={{ minHeight: "70px" }}
            />
          </div>

          {/* Paragraph Selection */}
          <div>
            <label className="block text-white font-medium mb-3 text-center">
              Number of Paragraphs per decision
            </label>
            <Carousel
              items={paragraphOptions}
              currentIndex={paragraphIndex >= 0 ? paragraphIndex : 0}
              onPrevious={handlePrevParagraph}
              onNext={handleNextParagraph}
              renderItem={renderParagraphOption}
              variant="purple"
              containerClassName="bg-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <ButtonOptions
            onClick={onGenerateStory}
            disabled={isGenerating}
            variant="blue"
            padding="py-4 px-8"
            fontSize="text-lg"
          >
            {isGenerating ? "Generating..." : "Generate Story"}
          </ButtonOptions>
        </div>
      </div>
    </div>
  );
};

export default StoryControls;
