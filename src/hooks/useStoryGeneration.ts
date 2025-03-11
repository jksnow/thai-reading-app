import { useState } from "react";
import deepseekService from "../api/deepseekService";
import {
  Choice,
  StoryParams,
  StorySegment,
  parseStoryResponse,
} from "../utils/storyUtils";

// example response from deepseekService.generateInitialStory
// "[คำศัพท์] [ผจญภัย] [ป่า] [สมบัติ]  \n[GOAL] -name-สมชาย ต้อง หา สมบัติ ใน ป่า และ กลับ บ้าน อย่าง ปลอดภัย.  \n[SUMMARY] -name-สมชาย เดิน ทาง เข้า ป่า เพื่อ หา สมบัติ ที่ ถูก ซ่อน ไว้. เขา ต้อง เผชิญ กับ อุปสรรค และ ตัดสินใจ อย่าง ฉลาด เพื่อ ไป ถึง เป้าหมาย.  \n\n-name-สมชาย ยืน อยู่ ที่ ทาง เข้า ป่า. เขา มอง ไป ที่ แผนที่ เก่า ๆ ใน มือ. แผนที่ บอก ว่า สมบัติ อยู่ ที่ ต้นไม้ ใหญ่ ตรง กลาง ป่า. -name-สมชาย เริ่ม เดิน เข้า ไป ใน ป่า.  \n\nระหว่าง ทาง เขา เห็น ทาง แยก. ทาง ซ้าย มี เสียง นก ร้อง. ทาง ขวา มี แสง สว่าง วิบ วิบ. -name-สมชาย ต้อง ตัดสินใจ ว่า จะ ไป ทาง ไหน.  \n\n[CHOICES]  \n1. เดิน ไป ทาง ซ้าย ฟัง เสียง นก.  \n2. เดิน ไป ทาง ขวา ตาม แสง สว่าง.  \n3. หยุด นิ่ง และ ฟัง เสียง รอบ ตัว."

export function useStoryGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);

  /**
   * Generate the initial story based on the provided parameters
   */
  const generateInitialStory = async (params: StoryParams) => {
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await deepseekService.generateInitialStory(params);
      const parsedStory = parseStoryResponse(response);

      setStoryHistory([parsedStory]);
      setCurrentStoryIndex(0);
      setShowChoices(false);
    } catch (error: any) {
      if (error.message.includes("API key")) {
        setErrorMessage(
          "OpenAI API key not found. Please set up your API key in the .env file."
        );
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Continue the story based on the selected choice
   */
  const continueStory = async (choiceText: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setErrorMessage("");
    setShowChoices(false);

    try {
      // Get the current story context
      const previousStories = storyHistory.slice(0, currentStoryIndex + 1);
      const storyGoal = storyHistory[currentStoryIndex].goal;
      const storyContext = previousStories.map((s) => s.text).join("\n");

      const response = await deepseekService.continueStory({
        storyGoal,
        storyContext,
        userChoice: choiceText,
      });

      const parsedStory = parseStoryResponse(response);

      // Update the story history
      setStoryHistory([...previousStories, parsedStory]);
      setCurrentStoryIndex(previousStories.length);
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Show available choices for the current story segment
   */
  const handleShowChoices = () => {
    setShowChoices(true);
  };

  /**
   * Handle selection of a choice
   */
  const handleChoiceSelect = (choice: Choice) => {
    continueStory(choice.text);
  };

  /**
   * Reset the story state
   */
  const resetStory = () => {
    setStoryHistory([]);
    setCurrentStoryIndex(0);
    setShowChoices(false);
    setErrorMessage("");
  };

  return {
    isGenerating,
    storyHistory,
    currentStoryIndex,
    showChoices,
    generateInitialStory,
    continueStory,
    handleShowChoices,
    handleChoiceSelect,
    resetStory,
  };
}
