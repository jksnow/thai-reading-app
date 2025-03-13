import { useState } from "react";
import deepseekService from "../api/deepseekService";
import {
  Choice,
  StoryParams,
  StorySegment,
  parseStoryResponse,
} from "../utils/storyUtils";

// example response from deepseekService.generateInitialStory
// "[GOAL]  \nThe protagonist must uncover the truth behind the haunted house and escape before the malevolent spirit claims their soul.\n\n[STORY]  \n[name]อ๊อด เดิน เข้า ไป ใน บ้าน เก่า แห่ง หนึ่ง ที่ เพื่อน บอก ว่า มี ผี สิง. ทุก อย่าง ดู เงียบ เกิน ไป. [name]อ๊อด เห็น เงา หนึ่ง เคลื่อน ไหว ที่ มุม ห้อง. เขา รู้สึก หนาว สั้น. ตรง กำแพง มี รูป วาด เก่า ๆ ที่ ตา ใน รูป ดู เหมือน จะ มอง มา ที่ เขา.  \n\n[name]อ๊อด ได้ยิน เสียง หัวเราะ เบา ๆ จาก ห้อง ข้าง บน. เสียง นั้น ทำให้ เขา รู้สึก กลัว. เขา เริ่ม เดิน ไป ที่ บันได เพื่อ ขึ้น ไป ดู ที่ ห้อง ข้าง บน. แต่ ขณะ เดิน ขึ้น บันได เขา เห็น รอย เลือด ที่ ไหล ลง มา จาก ขั้น บันได.  \n\n[SUMMARY]  \nAod explores an old, supposedly haunted house. He notices eerie shadows, unsettling paintings, and hears faint laughter. As he climbs the stairs to investigate, he sees blood dripping down the steps, heightening the tension and mystery.  \n\n[CHOICES]  \n1. เดิน ขึ้น ไป ต่อ ที่ ห้อง ข้าง บน.  \n2. วิ่ง กลับ ออก ไป จาก บ้าน ทันที.  \n3. เปิด ประตู ห้อง ที่ อยู่ ข้าง ๆ เพื่อ ดู ว่า มี อะไร อยู่."

export function useStoryGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [activeModifiers, setActiveModifiers] = useState<string[]>([]);

  /**
   * Generate the initial story based on the provided parameters
   */
  const generateInitialStory = async (
    params: StoryParams,
    selectedModifiers: string[] = []
  ) => {
    setIsGenerating(true);
    setErrorMessage("");
    setActiveModifiers(selectedModifiers); // Store the modifiers for later use

    try {
      const response = await deepseekService.generateInitialStory(
        params,
        selectedModifiers
      );
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
      const currentStory = storyHistory[currentStoryIndex];
      const storyContext = previousStories.map((s) => s.text).join("\n");

      // We'll use the stored modifiers here
      // This way, the same modifiers are used throughout the story
      const response = await deepseekService.continueStory(
        {
          storyGoal: currentStory.goal,
          summary: currentStory.summary,
          storyContext,
          userChoice: choiceText,
        },
        activeModifiers
      );

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
