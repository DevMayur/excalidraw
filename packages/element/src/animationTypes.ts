import type { Radians } from "@excalidraw/math";

/**
 * Animation keyframe types for different properties
 */
export type AnimationProperty = 
  | "position" 
  | "rotation" 
  | "scale" 
  | "opacity" 
  | "strokeColor" 
  | "backgroundColor"
  | "strokeWidth";

/**
 * Keyframe data structure
 */
export type AnimationKeyframe = {
  id: string;
  time: number; // Time in seconds
  elementId: string;
  property: AnimationProperty;
  value: number | string | { x: number; y: number };
  easing?: EasingFunction;
};

/**
 * Easing functions for animation interpolation
 */
export type EasingFunction = 
  | "linear"
  | "ease-in"
  | "ease-out" 
  | "ease-in-out"
  | "bounce"
  | "elastic";

/**
 * Animation track for a specific element and property
 */
export type AnimationTrack = {
  id: string;
  elementId: string;
  property: AnimationProperty;
  keyframes: AnimationKeyframe[];
  visible: boolean;
  locked: boolean;
};

/**
 * Animation timeline data
 */
export type AnimationTimeline = {
  id: string;
  name: string;
  duration: number; // Total duration in seconds
  tracks: AnimationTrack[];
  currentTime: number;
  isPlaying: boolean;
  loop: boolean;
  playbackRate: number;
};

/**
 * Position keyframe value
 */
export type PositionKeyframeValue = {
  x: number;
  y: number;
};

/**
 * Scale keyframe value
 */
export type ScaleKeyframeValue = {
  x: number;
  y: number;
};

/**
 * Animation state for an element at a specific time
 */
export type ElementAnimationState = {
  elementId: string;
  position: PositionKeyframeValue;
  rotation: number;
  scale: ScaleKeyframeValue;
  opacity: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
};

/**
 * Timeline UI state
 */
export type TimelineUIState = {
  zoom: number; // Zoom level for timeline
  scrollPosition: number; // Horizontal scroll position
  selectedKeyframes: string[]; // Selected keyframe IDs
  selectedTracks: string[]; // Selected track IDs
  isDragging: boolean;
  dragStartTime?: number;
  snapToGrid: boolean;
  gridSize: number; // Grid size in seconds
};

/**
 * Animation export settings
 */
export type AnimationExportSettings = {
  format: "gif" | "mp4" | "webm";
  fps: number;
  quality: number;
  width: number;
  height: number;
  duration: number;
  loop: boolean;
};

/**
 * Animation interpolation result
 */
export type InterpolationResult = {
  value: number | string | { x: number; y: number };
  isKeyframe: boolean;
  keyframeId?: string;
};
