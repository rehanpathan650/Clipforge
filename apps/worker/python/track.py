#!/usr/bin/env python3
"""Detect the main speaker's face over a time range and write normalised positions as JSON.

usage: track.py <video> <start_sec> <end_sec> <out.json>

Uses OpenCV's bundled Haar cascade (no model download). It is fast and good for talking-head
footage; the Node side falls back to a centre crop when too few faces are found.
"""
import json
import sys

import cv2


def main() -> None:
    src, start, end, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]

    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        json.dump({"samples": []}, open(out, "w"))
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    cap.set(cv2.CAP_PROP_POS_MSEC, start * 1000.0)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    step = max(1, int(round(fps / 5.0)))  # ~5 detections per second
    samples = []
    prev_cx = None
    i = 0

    while True:
        if not cap.grab():
            break
        pos = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
        t = pos if pos > 0 else start + i / fps
        if t > end:
            break
        if i % step == 0:
            ok, frame = cap.retrieve()
            if ok:
                h, w = frame.shape[:2]
                scale = 480.0 / w if w > 480 else 1.0
                small = cv2.resize(frame, None, fx=scale, fy=scale) if scale < 1.0 else frame
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                gw = gray.shape[1]
                faces = cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(max(24, int(gw * 0.04)),) * 2
                )
                if len(faces):
                    best = max(faces, key=lambda f: f[2] * f[3])
                    if prev_cx is not None:
                        # prefer the face we were already following unless another one is clearly bigger
                        near = [f for f in faces if abs((f[0] + f[2] / 2) / gw - prev_cx) < 0.15]
                        if near:
                            cand = max(near, key=lambda f: f[2] * f[3])
                            if cand[2] * cand[3] >= 0.5 * best[2] * best[3]:
                                best = cand
                    cx = (best[0] + best[2] / 2.0) / gw
                    prev_cx = cx
                    samples.append({"t": round(max(0.0, t - start), 3), "cx": round(float(cx), 4)})
        i += 1

    cap.release()
    with open(out, "w") as fh:
        json.dump({"samples": samples}, fh)


if __name__ == "__main__":
    main()
