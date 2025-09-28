import type {
  AnimationKeyframe,
  AnimationTrack,
  AnimationTimeline,
  AnimationProperty,
  EasingFunction,
  PositionKeyframeValue,
  ScaleKeyframeValue,
  InterpolationResult,
  ElementAnimationState,
} from "./animationTypes";

/**
 * Easing functions for animation interpolation
 */
export const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t: number) => t,
  "ease-in": (t: number) => t * t,
  "ease-out": (t: number) => 1 - Math.pow(1 - t, 2),
  "ease-in-out": (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  elastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * (2 * Math.PI) / 0.4) + 1;
  },
};

/**
 * Interpolate between two keyframes
 */
export function interpolateKeyframes(
  keyframe1: AnimationKeyframe,
  keyframe2: AnimationKeyframe,
  time: number,
): InterpolationResult {
  const timeDiff = keyframe2.time - keyframe1.time;
  if (timeDiff === 0) {
    return {
      value: keyframe2.value,
      isKeyframe: true,
      keyframeId: keyframe2.id,
    };
  }

  const t = (time - keyframe1.time) / timeDiff;
  const easing = keyframe1.easing || "linear";
  const easedT = easingFunctions[easing](t);

  // Check if we're exactly at a keyframe
  if (Math.abs(time - keyframe1.time) < 0.001) {
    return {
      value: keyframe1.value,
      isKeyframe: true,
      keyframeId: keyframe1.id,
    };
  }
  if (Math.abs(time - keyframe2.time) < 0.001) {
    return {
      value: keyframe2.value,
      isKeyframe: true,
      keyframeId: keyframe2.id,
    };
  }

  // Interpolate based on value type
  let interpolatedValue: any;

  if (typeof keyframe1.value === "number" && typeof keyframe2.value === "number") {
    interpolatedValue = keyframe1.value + (keyframe2.value - keyframe1.value) * easedT;
  } else if (
    typeof keyframe1.value === "object" &&
    typeof keyframe2.value === "object" &&
    keyframe1.value !== null &&
    keyframe2.value !== null
  ) {
    // Handle position and scale objects
    const val1 = keyframe1.value as PositionKeyframeValue | ScaleKeyframeValue;
    const val2 = keyframe2.value as PositionKeyframeValue | ScaleKeyframeValue;
    interpolatedValue = {
      x: val1.x + (val2.x - val1.x) * easedT,
      y: val1.y + (val2.y - val1.y) * easedT,
    };
  } else {
    // For string values (colors), use the closest keyframe
    interpolatedValue = easedT < 0.5 ? keyframe1.value : keyframe2.value;
  }

  return {
    value: interpolatedValue,
    isKeyframe: false,
  };
}

/**
 * Get the interpolated value for a property at a specific time
 */
export function getPropertyValueAtTime(
  track: AnimationTrack,
  time: number,
): InterpolationResult | null {
  if (track.keyframes.length === 0) {
    return null;
  }

  // Sort keyframes by time
  const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time);

  // If time is before first keyframe, return first keyframe value
  if (time <= sortedKeyframes[0].time) {
    return {
      value: sortedKeyframes[0].value,
      isKeyframe: true,
      keyframeId: sortedKeyframes[0].id,
    };
  }

  // If time is after last keyframe, return last keyframe value
  if (time >= sortedKeyframes[sortedKeyframes.length - 1].time) {
    const lastKeyframe = sortedKeyframes[sortedKeyframes.length - 1];
    return {
      value: lastKeyframe.value,
      isKeyframe: true,
      keyframeId: lastKeyframe.id,
    };
  }

  // Find the two keyframes to interpolate between
  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    const current = sortedKeyframes[i];
    const next = sortedKeyframes[i + 1];

    if (time >= current.time && time <= next.time) {
      return interpolateKeyframes(current, next, time);
    }
  }

  return null;
}

/**
 * Get all element animation states at a specific time
 */
export function getElementStatesAtTime(
  timeline: AnimationTimeline,
  time: number,
): Map<string, ElementAnimationState> {
  const elementStates = new Map<string, ElementAnimationState>();

  // Group tracks by element ID
  const tracksByElement = new Map<string, AnimationTrack[]>();
  for (const track of timeline.tracks) {
    if (!tracksByElement.has(track.elementId)) {
      tracksByElement.set(track.elementId, []);
    }
    tracksByElement.get(track.elementId)!.push(track);
  }

  // Calculate state for each element
  for (const [elementId, tracks] of tracksByElement) {
    const state: ElementAnimationState = {
      elementId,
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      opacity: 1,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      strokeWidth: 1,
    };

    // Apply each track's value
    for (const track of tracks) {
      const result = getPropertyValueAtTime(track, time);
      if (result) {
        switch (track.property) {
          case "position":
            state.position = result.value as PositionKeyframeValue;
            break;
          case "rotation":
            state.rotation = result.value as number;
            break;
          case "scale":
            state.scale = result.value as ScaleKeyframeValue;
            break;
          case "opacity":
            state.opacity = result.value as number;
            break;
          case "strokeColor":
            state.strokeColor = result.value as string;
            break;
          case "backgroundColor":
            state.backgroundColor = result.value as string;
            break;
          case "strokeWidth":
            state.strokeWidth = result.value as number;
            break;
        }
      }
    }

    elementStates.set(elementId, state);
  }

  return elementStates;
}

/**
 * Add a keyframe to a track
 */
export function addKeyframe(
  track: AnimationTrack,
  keyframe: Omit<AnimationKeyframe, "id">,
): AnimationTrack {
  const newKeyframe: AnimationKeyframe = {
    ...keyframe,
    id: `keyframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  return {
    ...track,
    keyframes: [...track.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
  };
}

/**
 * Remove a keyframe from a track
 */
export function removeKeyframe(track: AnimationTrack, keyframeId: string): AnimationTrack {
  return {
    ...track,
    keyframes: track.keyframes.filter((kf) => kf.id !== keyframeId),
  };
}

/**
 * Update a keyframe in a track
 */
export function updateKeyframe(
  track: AnimationTrack,
  keyframeId: string,
  updates: Partial<AnimationKeyframe>,
): AnimationTrack {
  return {
    ...track,
    keyframes: track.keyframes.map((kf) =>
      kf.id === keyframeId ? { ...kf, ...updates } : kf,
    ),
  };
}

/**
 * Create a new animation track
 */
export function createTrack(
  elementId: string,
  property: AnimationProperty,
): AnimationTrack {
  return {
    id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    elementId,
    property,
    keyframes: [],
    visible: true,
    locked: false,
  };
}

/**
 * Create a new animation timeline
 */
export function createTimeline(name: string = "New Animation"): AnimationTimeline {
  return {
    id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    duration: 10, // 10 seconds default
    tracks: [],
    currentTime: 0,
    isPlaying: false,
    loop: false,
    playbackRate: 1,
  };
}

/**
 * Format time for display (MM:SS.mmm)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const wholeSeconds = Math.floor(remainingSeconds);
  const milliseconds = Math.floor((remainingSeconds - wholeSeconds) * 1000);

  return `${minutes.toString().padStart(2, "0")}:${wholeSeconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/**
 * Parse time from display format (MM:SS.mmm)
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(":");
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0], 10) || 0;
  const secondsParts = parts[1].split(".");
  const seconds = parseInt(secondsParts[0], 10) || 0;
  const milliseconds = parseInt(secondsParts[1] || "0", 10) || 0;

  return minutes * 60 + seconds + milliseconds / 1000;
}
