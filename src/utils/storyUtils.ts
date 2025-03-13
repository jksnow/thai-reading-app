// example response from deepseekService.generateInitialStory
// "[GOAL]  \nThe protagonist must uncover the truth behind the haunted house and escape before the malevolent spirit claims their soul.\n\n[STORY]  \n[name]อ๊อด เดิน เข้า ไป ใน บ้าน เก่า แห่ง หนึ่ง ที่ เพื่อน บอก ว่า มี ผี สิง. ทุก อย่าง ดู เงียบ เกิน ไป. [name]อ๊อด เห็น เงา หนึ่ง เคลื่อน ไหว ที่ มุม ห้อง. เขา รู้สึก หนาว สั้น. ตรง กำแพง มี รูป วาด เก่า ๆ ที่ ตา ใน รูป ดู เหมือน จะ มอง มา ที่ เขา.  \n\n[name]อ๊อด ได้ยิน เสียง หัวเราะ เบา ๆ จาก ห้อง ข้าง บน. เสียง นั้น ทำให้ เขา รู้สึก กลัว. เขา เริ่ม เดิน ไป ที่ บันได เพื่อ ขึ้น ไป ดู ที่ ห้อง ข้าง บน. แต่ ขณะ เดิน ขึ้น บันได เขา เห็น รอย เลือด ที่ ไหล ลง มา จาก ขั้น บันได.  \n\n[SUMMARY]  \nAod explores an old, supposedly haunted house. He notices eerie shadows, unsettling paintings, and hears faint laughter. As he climbs the stairs to investigate, he sees blood dripping down the steps, heightening the tension and mystery.  \n\n[CHOICES]  \n1. เดิน ขึ้น ไป ต่อ ที่ ห้อง ข้าง บน.  \n2. วิ่ง กลับ ออก ไป จาก บ้าน ทันที.  \n3. เปิด ประตู ห้อง ที่ อยู่ ข้าง ๆ เพื่อ ดู ว่า มี อะไร อยู่."

// Story utility functions

export interface Choice {
  id: number;
  text: string;
}

export interface StorySegment {
  text: string;
  goal: string;
  summary: string;
  choices: Choice[];
  isEnding: boolean;
}

export interface StoryParams {
  genre: string;
  parentalRating: string;
  readingLevel: string;
  paragraphs: number;
}

/**
 * Parse the raw response from the AI service into a structured StorySegment
 */
export const parseStoryResponse = (response: string): StorySegment => {
  // Extract goal
  const goalMatch = response.match(/\[GOAL\](.+?)(?=\[STORY\])/s);
  const goal = goalMatch ? goalMatch[1].trim() : "";

  // Extract story
  const storyMatch = response.match(/\[STORY\](.+?)(?=\[SUMMARY\])/s);
  const storyText = storyMatch ? storyMatch[1].trim() : "";

  // Extract summary
  const summaryMatch = response.match(/\[SUMMARY\](.+?)(?=\[CHOICES\]|$)/s);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";

  // Extract choices
  const choicesMatch = response.match(/\[CHOICES\](.+?)$/s);

  let choices: Choice[] = [];
  let isEnding = false;

  // Check if the story has reached an ending
  if (!choicesMatch || choicesMatch[1].includes("THE END")) {
    isEnding = true;
  } else if (choicesMatch) {
    // Parse the choices
    const choicesText = choicesMatch[1];
    const choiceLines = choicesText.split("\n");

    choices = choiceLines
      .filter((line) => /^\d+\./.test(line)) // Filter lines that start with a number and dot
      .map((line, index) => {
        const match = line.match(/^\d+\.\s*(.*)/);
        return {
          id: index + 1,
          text: match ? match[1].trim() : line.trim(),
        };
      });
  }

  return {
    text: storyText,
    goal,
    summary,
    choices,
    isEnding,
  };
};

/**
 * Check if a word is standalone punctuation
 */
export const isPunctuation = (word: string): boolean => {
  return /^[.,?!;:]$/.test(word);
};

/**
 * Check if a word is a character name
 */
export const isCharacterName = (word: string): boolean => {
  return word.startsWith("[name]");
};

/**
 * Clean a character name by removing the [name] prefix
 */
export const cleanCharacterName = (word: string): string => {
  return word.replace("[name]", "");
};

/**
 * Get the CSS class for font size
 */
export const getFontSizeClass = (size: string): string => {
  switch (size) {
    case "small":
      return "text-3xl leading-loose";
    case "medium":
      return "text-4xl leading-loose";
    case "large":
      return "text-5xl leading-loose";
    default:
      return "text-3xl leading-loose";
  }
};
