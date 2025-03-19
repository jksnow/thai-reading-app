import { ObjectId } from "mongodb";

export interface Meaning {
  meaning: string;
  partOfSpeech: string;
  displayOrder: number;
}

export interface Translation {
  _id?: ObjectId;
  t2e: string;
  word: string;
  meanings: Meaning[];
  dateAdded: string;
}

export const TRANSLATIONS_COLLECTION = "translations";
