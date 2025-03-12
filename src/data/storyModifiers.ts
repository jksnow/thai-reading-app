// Types for story modifiers
export interface StoryModifier {
  id: string;
  modifier: string;
  description: string;
  category: ModifierCategory;
}

// Categories for the modifiers
export enum ModifierCategory {
  Setting = "setting",
  Character = "character",
  Plot = "plot",
  Tone = "tone",
  Perspective = "perspective",
  NarrativeStyle = "narrativeStyle",
}

// Seed data for story modifiers
export const storyModifiers: StoryModifier[] = [
  // Setting Modifiers
  {
    id: "s1",
    modifier: "Bangkok City",
    description: "Set the story in the bustling capital city of Thailand",
    category: ModifierCategory.Setting,
  },
  {
    id: "s2",
    modifier: "Northern Village",
    description: "Set the story in a peaceful village in northern Thailand",
    category: ModifierCategory.Setting,
  },
  {
    id: "s3",
    modifier: "Island Paradise",
    description: "Set the story on one of Thailand's beautiful islands",
    category: ModifierCategory.Setting,
  },
  {
    id: "s4",
    modifier: "Ancient Temple",
    description: "Set the story in or around a historic Thai temple",
    category: ModifierCategory.Setting,
  },

  // Character Modifiers
  {
    id: "c1",
    modifier: "Thai Language Student",
    description: "The protagonist is a Thai language student",
    category: ModifierCategory.Character,
  },
  {
    id: "c2",
    modifier: "Foreign Traveler",
    description: "The protagonist is a foreigner traveler",
    category: ModifierCategory.Character,
  },
  {
    id: "c3",
    modifier: "Wise Elder",
    description: "Include a wise elder who offers guidance and wisdom",
    category: ModifierCategory.Character,
  },
  {
    id: "c4",
    modifier: "Street Vendor",
    description: "Include a character who sells Thai street food or goods",
    category: ModifierCategory.Character,
  },

  // Secret Identity
  {
    id: "c6",
    modifier: "Secret Identity",
    description: "Someone is hiding a secret identity that will be revealed.",
    category: ModifierCategory.Character,
  },

  // Plot Modifiers
  {
    id: "p1",
    modifier: "Lost Treasure",
    description: "The story involves finding a lost Thai artifact or treasure",
    category: ModifierCategory.Plot,
  },
  {
    id: "p2",
    modifier: "Cultural Festival",
    description: "The story takes place during a traditional Thai festival",
    category: ModifierCategory.Plot,
  },
  {
    id: "p3",
    modifier: "Nature Adventure",
    description: "Characters explore Thailand's natural environments",
    category: ModifierCategory.Plot,
  },
  {
    id: "p4",
    modifier: "Mystery to Solve",
    description: "Characters must solve a local mystery using Thai knowledge",
    category: ModifierCategory.Plot,
  },
  {
    id: "p5",
    modifier: "Difficult Moral Choice",
    description: "You must make a difficult moral choice",
    category: ModifierCategory.Plot,
  },
  {
    id: "p6",
    modifier: "Twist Ending",
    description: "The story has a twist ending",
    category: ModifierCategory.Plot,
  },

  // Tone Modifiers
  {
    id: "t1",
    modifier: "Humorous",
    description: "Include Thai humor and playful situations",
    category: ModifierCategory.Tone,
  },
  {
    id: "t2",
    modifier: "Friendship",
    description: "There is a friendship at the heart of the story",
    category: ModifierCategory.Tone,
  },
  {
    id: "t3",
    modifier: "Mysterious",
    description: "Include elements of mystery",
    category: ModifierCategory.Tone,
  },
  {
    id: "t4",
    modifier: "Inspirational",
    description: "Tell an uplifting story with inspirational values",
    category: ModifierCategory.Tone,
  },
  {
    id: "t5",
    modifier: "Dark Comedy",
    description: "Make the story a dark comedy",
    category: ModifierCategory.Tone,
  },
  {
    id: "ns1",
    modifier: "Non-linear Timeline",
    description: "Events unfold out of chronological order",
    category: ModifierCategory.NarrativeStyle,
  },
  {
    id: "ns2",
    modifier: "Fable with Talking Animals",
    description: "Tell the story as a fable with talking animals",
    category: ModifierCategory.NarrativeStyle,
  },
  {
    id: "ns3",
    modifier: "Shaggy Dog Story",
    description: "A long, winding tale ends in an absurd or anticlimactic way",
    category: ModifierCategory.NarrativeStyle,
  },
  {
    id: "ns4",
    modifier: "Frame Narrative",
    description: "The main story is told within a larger context",
    category: ModifierCategory.NarrativeStyle,
  },
  // Unreliable Narrator
  {
    id: "ns5",
    modifier: "Unreliable Narrator",
    description:
      "The story is told from the perspective of an unreliable narrator",
    category: ModifierCategory.NarrativeStyle,
  },
];

export default storyModifiers;
