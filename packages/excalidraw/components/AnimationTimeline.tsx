import React, { useState, useRef, useCallback, useEffect } from "react";
import clsx from "clsx";
import { useI18n } from "../i18n";
import { useUIAppState } from "../context/ui-appState";
// import { useExcalidrawSetAppState } from "./App";
import { getSelectedElements } from "@excalidraw/element";
import { Island } from "./Island";
// import { Section } from "./Section";
import Stack from "./Stack";
import { Button } from "./Button";
import { 
  type AnimationTimeline, 
  type AnimationTrack, 
  type AnimationKeyframe,
  type TimelineUIState,
  type AnimationProperty 
} from "@excalidraw/element/animationTypes";
import { 
  formatTime, 
  parseTime,
  createTimeline,
  addKeyframe,
  removeKeyframe,
  updateKeyframe 
} from "@excalidraw/element/animationUtils";

import "./AnimationTimeline.scss";

interface AnimationTimelineProps {
  timeline: AnimationTimeline;
  onTimelineChange: (timeline: AnimationTimeline) => void;
  onTimeChange: (time: number) => void;
  onTrackChange: (track: AnimationTrack) => void;
  onKeyframeChange: (keyframe: AnimationKeyframe) => void;
  onKeyframeAdd: (trackId: string, keyframe: Omit<AnimationKeyframe, "id">) => void;
  onKeyframeRemove: (keyframeId: string) => void;
}

export const AnimationTimelineComponent: React.FC<AnimationTimelineProps> = ({
  timeline,
  onTimelineChange,
  onTimeChange,
  onTrackChange,
  onKeyframeChange,
  onKeyframeAdd,
  onKeyframeRemove,
}) => {
  const { t } = useI18n();
  const appState = useUIAppState();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [uiState, setUIState] = useState<TimelineUIState>({
    zoom: 1,
    scrollPosition: 0,
    selectedKeyframes: [],
    selectedTracks: [],
    isDragging: false,
    snapToGrid: true,
    gridSize: 1, // 1 second grid
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);

  const selectedElements = getSelectedElements([], { selectedElementIds: appState.selectedElementIds });

  // Calculate timeline dimensions
  const timelineWidth = timeline.duration * 100 * uiState.zoom; // 100px per second
  const trackHeight = 40;
  const timeRulerHeight = 30;

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    onTimeChange(0);
  }, [onTimeChange]);

  const handleLoopToggle = useCallback(() => {
    setLoop(!loop);
  }, [loop]);

  // Handle time scrubbing
  const handleTimeScrub = useCallback((event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - 60; // Account for track labels
    const time = Math.max(0, Math.min(timeline.duration, x / (100 * uiState.zoom)));
    
    onTimeChange(time);
  }, [timeline.duration, uiState.zoom, onTimeChange]);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setUIState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 10) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setUIState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.1) }));
  }, []);

  // Handle keyframe drag
  const handleKeyframeDrag = useCallback((keyframeId: string, newTime: number) => {
    const track = timeline.tracks.find(t => t.keyframes.some(kf => kf.id === keyframeId));
    if (!track) return;

    const updatedKeyframe = track.keyframes.find(kf => kf.id === keyframeId);
    if (!updatedKeyframe) return;

    const clampedTime = Math.max(0, Math.min(timeline.duration, newTime));
    onKeyframeChange({ ...updatedKeyframe, time: clampedTime });
  }, [timeline.tracks, timeline.duration, onKeyframeChange]);

  // Render time ruler
  const renderTimeRuler = () => {
    const timeMarks = [];
    const markInterval = uiState.zoom > 2 ? 0.1 : uiState.zoom > 1 ? 0.5 : 1;
    
    for (let time = 0; time <= timeline.duration; time += markInterval) {
      const x = time * 100 * uiState.zoom;
      timeMarks.push(
        <div
          key={time}
          className="time-mark"
          style={{ left: x }}
        >
          <div className="time-mark-line" />
          <div className="time-mark-label">{formatTime(time)}</div>
        </div>
      );
    }

    return (
      <div className="time-ruler" style={{ height: timeRulerHeight }}>
        {timeMarks}
      </div>
    );
  };

  // Render playhead
  const renderPlayhead = () => {
    const x = timeline.currentTime * 100 * uiState.zoom;
    
    return (
      <div
        className="playhead"
        style={{ left: x + 60 }} // Account for track labels
        onMouseDown={(e) => {
          e.preventDefault();
          // Handle playhead drag
        }}
      >
        <div className="playhead-line" />
        <div className="playhead-handle" />
      </div>
    );
  };

  // Render track
  const renderTrack = (track: AnimationTrack) => {
    const keyframes = track.keyframes.map(keyframe => {
      const x = keyframe.time * 100 * uiState.zoom;
      
      return (
        <div
          key={keyframe.id}
          className={clsx("keyframe", {
            selected: uiState.selectedKeyframes.includes(keyframe.id),
          })}
          style={{ left: x }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setUIState(prev => ({
              ...prev,
              selectedKeyframes: [keyframe.id],
            }));
            // Handle keyframe drag
          }}
        >
          <div className="keyframe-handle" />
        </div>
      );
    });

    return (
      <div
        key={track.id}
        className={clsx("track", {
          selected: uiState.selectedTracks.includes(track.id),
          locked: track.locked,
        })}
        style={{ height: trackHeight }}
      >
        <div className="track-label">
          <span className="track-name">
            {track.elementId} - {track.property}
          </span>
          <div className="track-controls">
            <button
              className={clsx("track-control", { active: track.visible })}
              onClick={() => onTrackChange({ ...track, visible: !track.visible })}
              title={track.visible ? t("animation.hideTrack") : t("animation.showTrack")}
            >
              👁
            </button>
            <button
              className={clsx("track-control", { active: track.locked })}
              onClick={() => onTrackChange({ ...track, locked: !track.locked })}
              title={track.locked ? t("animation.unlockTrack") : t("animation.lockTrack")}
            >
              🔒
            </button>
          </div>
        </div>
        <div className="track-content">
          {keyframes}
        </div>
      </div>
    );
  };

  return (
    <Island className="animation-timeline">
      <div className="animation-section">
        <h3>{t("animation.timeline")}</h3>
        <Stack.Col gap={4}>
          {/* Timeline Controls */}
          <div className="timeline-controls">
            <div className="playback-controls">
              <Button
                onSelect={handlePlayPause}
                className={clsx("play-btn", { playing: isPlaying })}
              >
                {isPlaying ? "⏸" : "▶"}
              </Button>
              <Button onSelect={handleStop}>⏹</Button>
              <Button
                onSelect={handleLoopToggle}
                className={clsx("loop-btn", { active: loop })}
              >
                🔄
              </Button>
            </div>
            
            <div className="time-controls">
              <span className="time-display">{formatTime(timeline.currentTime)}</span>
              <span className="time-separator">/</span>
              <span className="time-display">{formatTime(timeline.duration)}</span>
            </div>

            <div className="zoom-controls">
              <Button onSelect={handleZoomOut}>-</Button>
              <span className="zoom-level">{Math.round(uiState.zoom * 100)}%</span>
              <Button onSelect={handleZoomIn}>+</Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-container">
            <div
              ref={timelineRef}
              className="timeline"
              style={{ width: timelineWidth + 60 }}
              onClick={handleTimeScrub}
            >
              {renderTimeRuler()}
              {renderPlayhead()}
              
              <div className="tracks-container">
                {timeline.tracks.map(renderTrack)}
              </div>
            </div>
          </div>

          {/* Timeline Properties */}
          <div className="timeline-properties">
            <div className="property-group">
              <label>{t("animation.duration")}:</label>
              <input
                type="number"
                value={timeline.duration}
                onChange={(e) => onTimelineChange({ ...timeline, duration: parseFloat(e.target.value) || 1 })}
                min={1}
                max={300}
                step={1}
                className="number-input"
                placeholder="s"
              />
            </div>
            
            <div className="property-group">
              <label>{t("animation.playbackRate")}:</label>
              <input
                type="number"
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value) || 1)}
                min={0.1}
                max={5}
                step={0.1}
                className="number-input"
                placeholder="x"
              />
            </div>
          </div>
        </Stack.Col>
      </div>
    </Island>
  );
};
