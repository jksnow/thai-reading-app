import { ObjectId } from "mongodb";

export interface ResponseTime {
  _id?: ObjectId;
  averageTime: number;
  samples: number;
  lastUpdated: string;
}

export const RESPONSE_TIMES_COLLECTION = "responseTimes";
