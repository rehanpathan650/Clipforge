export type Word = { word: string; start: number; end: number };
export type Segment = { text: string; start: number; end: number };
export type PickedClip = {
  index: number;
  start: number;
  end: number;
  title: string;
  reason: string;
  score: number;
};
