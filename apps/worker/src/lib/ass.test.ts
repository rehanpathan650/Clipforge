import assert from "node:assert/strict";
import { test } from "node:test";
import type { Word } from "../types";
import { buildAss, group, ts } from "./ass";

const words: Word[] = [
  { word: "hello", start: 10.0, end: 10.4 },
  { word: "world.", start: 10.4, end: 10.9 },
  { word: "second", start: 11.5, end: 11.9 },
  { word: "line", start: 11.9, end: 12.3 },
  { word: "outside", start: 99, end: 99.5 },
];

test("ts formats H:MM:SS.cc and handles rounding", () => {
  assert.equal(ts(0), "0:00:00.00");
  assert.equal(ts(61.239), "0:01:01.24");
  assert.equal(ts(3599.996), "1:00:00.00");
});

test("group breaks on sentence end, pauses and word limit", () => {
  const g = group(words.slice(0, 4), 3, 40);
  assert.deepEqual(g.map((c) => c.map((w) => w.word)), [["hello", "world."], ["second", "line"]]);
});

test("karaoke style fills words and is relative to the clip start", () => {
  const ass = buildAss(words, 10, 13, "karaoke");
  assert.match(ass, /\\kf/);
  assert.match(ass, /HELLO/);
  assert.match(ass, /Dialogue: 0,0:00:00\.00,/);
  assert.doesNotMatch(ass, /OUTSIDE/);
});

test("pop style emits one event per word", () => {
  const ass = buildAss(words, 10, 13, "pop");
  assert.equal(ass.split("\n").filter((l) => l.startsWith("Dialogue")).length, 4);
});

test("clean style is plain text without karaoke tags or forced caps", () => {
  const ass = buildAss(words, 10, 13, "clean");
  assert.doesNotMatch(ass, /\\kf/);
  assert.match(ass, /hello world\./);
});

test("override braces in words cannot inject ASS tags", () => {
  const ass = buildAss([{ word: "{\\an8}hi", start: 0, end: 1 }], 0, 2, "clean");
  assert.doesNotMatch(ass, /\\an8/);
});
