import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react";
import { 
  type AnimationTimeline, 
  type AnimationTrack, 
  type AnimationKeyframe,
  type AnimationProperty 
} from "@excalidraw/element/animationTypes";
import { 
  createTimeline,
  addKeyframe,
  removeKeyframe,
  updateKeyframe,
  getElementStatesAtTime,
  formatTime 
} from "@excalidraw/element/animationUtils";
import { ExcalidrawElement } from "@excalidraw/element/types";
import { mutateElement } from "@excalidraw/element";

// Animation state
interface AnimationState {
  timeline: AnimationTimeline;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  loop: boolean;
  selectedElementId?: string;
  selectedTrackId?: string;
  selectedKeyframeIds: string[];
}

// Animation actions
type AnimationAction =
  | { type: "SET_TIMELINE"; payload: AnimationTimeline }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_PLAYBACK_RATE"; payload: number }
  | { type: "SET_LOOP"; payload: boolean }
  | { type: "SET_SELECTED_ELEMENT"; payload: string | undefined }
  | { type: "SET_SELECTED_TRACK"; payload: string | undefined }
  | { type: "SET_SELECTED_KEYFRAMES"; payload: string[] }
  | { type: "ADD_TRACK"; payload: { elementId: string; property: AnimationProperty } }
  | { type: "REMOVE_TRACK"; payload: string }
  | { type: "UPDATE_TRACK"; payload: AnimationTrack }
  | { type: "ADD_KEYFRAME"; payload: { trackId: string; keyframe: Omit<AnimationKeyframe, "id"> } }
  | { type: "REMOVE_KEYFRAME"; payload: string }
  | { type: "UPDATE_KEYFRAME"; payload: AnimationKeyframe }
  | { type: "TICK"; payload: number };

// Animation reducer
function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action.type) {
    case "SET_TIMELINE":
      return { ...state, timeline: action.payload };
    
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    
    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.payload };
    
    case "SET_LOOP":
      return { ...state, loop: action.payload };
    
    case "SET_SELECTED_ELEMENT":
      return { ...state, selectedElementId: action.payload };
    
    case "SET_SELECTED_TRACK":
      return { ...state, selectedTrackId: action.payload };
    
    case "SET_SELECTED_KEYFRAMES":
      return { ...state, selectedKeyframeIds: action.payload };
    
    case "ADD_TRACK": {
      const newTrack = {
        id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        elementId: action.payload.elementId,
        property: action.payload.property,
        keyframes: [],
        visible: true,
        locked: false,
      };
      return {
        ...state,
        timeline: {
          ...state.timeline,
          tracks: [...state.timeline.tracks, newTrack],
        },
      };
    }
    
    case "REMOVE_TRACK":
      return {
        ...state,
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.filter(track => track.id !== action.payload),
        },
      };
    
    case "UPDATE_TRACK":
      return {
        ...state,
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.map(track =>
            track.id === action.payload.id ? action.payload : track
          ),
        },
      };
    
    case "ADD_KEYFRAME": {
      const track = state.timeline.tracks.find(t => t.id === action.payload.trackId);
      if (!track) return state;
      
      const newKeyframe: AnimationKeyframe = {
        ...action.payload.keyframe,
        id: `keyframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      const updatedTrack = {
        ...track,
        keyframes: [...track.keyframes, newKeyframe].sort((a, b) => a.time - b.time),
      };
      
      return {
        ...state,
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.map(t =>
            t.id === action.payload.trackId ? updatedTrack : t
          ),
        },
      };
    }
    
    case "REMOVE_KEYFRAME":
      return {
        ...state,
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.map(track => ({
            ...track,
            keyframes: track.keyframes.filter(kf => kf.id !== action.payload),
          })),
        },
      };
    
    case "UPDATE_KEYFRAME":
      return {
        ...state,
        timeline: {
          ...state.timeline,
          tracks: state.timeline.tracks.map(track => ({
            ...track,
            keyframes: track.keyframes.map(kf =>
              kf.id === action.payload.id ? action.payload : kf
            ),
          })),
        },
      };
    
    case "TICK": {
      const newTime = state.currentTime + action.payload * state.playbackRate;
      let finalTime = newTime;
      
      if (newTime >= state.timeline.duration) {
        if (state.loop) {
          finalTime = newTime % state.timeline.duration;
        } else {
          finalTime = state.timeline.duration;
          return { ...state, currentTime: finalTime, isPlaying: false };
        }
      }
      
      return { ...state, currentTime: finalTime };
    }
    
    default:
      return state;
  }
}

// Animation context
interface AnimationContextValue {
  state: AnimationState;
  dispatch: React.Dispatch<AnimationAction>;
  
  // Actions
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setLoop: (loop: boolean) => void;
  setSelectedElement: (elementId: string | undefined) => void;
  setSelectedTrack: (trackId: string | undefined) => void;
  setSelectedKeyframes: (keyframeIds: string[]) => void;
  
  addTrack: (elementId: string, property: AnimationProperty) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (track: AnimationTrack) => void;
  
  addKeyframe: (trackId: string, keyframe: Omit<AnimationKeyframe, "id">) => void;
  removeKeyframe: (keyframeId: string) => void;
  updateKeyframe: (keyframe: AnimationKeyframe) => void;
  
  // Animation playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  
  // Element animation
  applyAnimationToElements: (elements: ExcalidrawElement[]) => ExcalidrawElement[];
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

// Animation provider
interface AnimationProviderProps {
  children: React.ReactNode;
  initialTimeline?: AnimationTimeline;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  initialTimeline,
}) => {
  const [state, dispatch] = useReducer(animationReducer, {
    timeline: initialTimeline || createTimeline(),
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    loop: false,
    selectedElementId: undefined,
    selectedTrackId: undefined,
    selectedKeyframeIds: [],
  });

  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    if (state.isPlaying) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = currentTime;
        }
        
        const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
        lastTimeRef.current = currentTime;
        
        dispatch({ type: "TICK", payload: deltaTime });
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      lastTimeRef.current = 0;
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isPlaying]);

  // Actions
  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: "SET_CURRENT_TIME", payload: time });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: "SET_PLAYING", payload: playing });
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    dispatch({ type: "SET_PLAYBACK_RATE", payload: rate });
  }, []);

  const setLoop = useCallback((loop: boolean) => {
    dispatch({ type: "SET_LOOP", payload: loop });
  }, []);

  const setSelectedElement = useCallback((elementId: string | undefined) => {
    dispatch({ type: "SET_SELECTED_ELEMENT", payload: elementId });
  }, []);

  const setSelectedTrack = useCallback((trackId: string | undefined) => {
    dispatch({ type: "SET_SELECTED_TRACK", payload: trackId });
  }, []);

  const setSelectedKeyframes = useCallback((keyframeIds: string[]) => {
    dispatch({ type: "SET_SELECTED_KEYFRAMES", payload: keyframeIds });
  }, []);

  const addTrack = useCallback((elementId: string, property: AnimationProperty) => {
    dispatch({ type: "ADD_TRACK", payload: { elementId, property } });
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    dispatch({ type: "REMOVE_TRACK", payload: trackId });
  }, []);

  const updateTrack = useCallback((track: AnimationTrack) => {
    dispatch({ type: "UPDATE_TRACK", payload: track });
  }, []);

  const addKeyframe = useCallback((trackId: string, keyframe: Omit<AnimationKeyframe, "id">) => {
    dispatch({ type: "ADD_KEYFRAME", payload: { trackId, keyframe } });
  }, []);

  const removeKeyframe = useCallback((keyframeId: string) => {
    dispatch({ type: "REMOVE_KEYFRAME", payload: keyframeId });
  }, []);

  const updateKeyframe = useCallback((keyframe: AnimationKeyframe) => {
    dispatch({ type: "UPDATE_KEYFRAME", payload: keyframe });
  }, []);

  const play = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: true });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: false });
  }, []);

  const stop = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: false });
    dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
  }, []);

  const applyAnimationToElements = useCallback((elements: ExcalidrawElement[]): ExcalidrawElement[] => {
    const elementStates = getElementStatesAtTime(state.timeline, state.currentTime);
    
    return elements.map(element => {
      const animationState = elementStates.get(element.id);
      if (!animationState) return element;
      
      return mutateElement(element, new Map(), {
        x: animationState.position.x,
        y: animationState.position.y,
        angle: animationState.rotation as any,
        opacity: animationState.opacity,
        strokeColor: animationState.strokeColor,
        backgroundColor: animationState.backgroundColor,
        strokeWidth: animationState.strokeWidth,
      });
    });
  }, [state.timeline, state.currentTime]);

  const contextValue: AnimationContextValue = {
    state,
    dispatch,
    setCurrentTime,
    setPlaying,
    setPlaybackRate,
    setLoop,
    setSelectedElement,
    setSelectedTrack,
    setSelectedKeyframes,
    addTrack,
    removeTrack,
    updateTrack,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    play,
    pause,
    stop,
    applyAnimationToElements,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Hook to use animation context
export const useAnimation = (): AnimationContextValue => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};
