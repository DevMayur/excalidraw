import React, { useState } from "react";
import clsx from "clsx";
import { useI18n } from "../i18n";
import { useUIAppState } from "../context/ui-appState";
import { useExcalidrawSetAppState } from "./App";
import { useAnimation } from "./AnimationManager";
import { AnimationTimelineComponent } from "./AnimationTimeline";
import { Button } from "./Button";
import { formatTime } from "@excalidraw/element/animationUtils";

import "./AnimationBottomPanel.scss";

interface AnimationBottomPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const AnimationBottomPanel: React.FC<AnimationBottomPanelProps> = ({
  isVisible,
  onToggle,
}) => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const animation = useAnimation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleTimelineChange = React.useCallback((timeline: any) => {
    animation.dispatch({ type: "SET_TIMELINE", payload: timeline });
  }, [animation]);

  const handleTimeChange = React.useCallback((time: number) => {
    animation.setCurrentTime(time);
  }, [animation]);

  const handleTrackChange = React.useCallback((track: any) => {
    animation.updateTrack(track);
  }, [animation]);

  const handleKeyframeChange = React.useCallback((keyframe: any) => {
    animation.updateKeyframe(keyframe);
  }, [animation]);

  const handleKeyframeAdd = React.useCallback((trackId: string, keyframe: any) => {
    animation.addKeyframe(trackId, keyframe);
  }, [animation]);

  const handleKeyframeRemove = React.useCallback((keyframeId: string) => {
    animation.removeKeyframe(keyframeId);
  }, [animation]);

  const handlePlayPause = React.useCallback(() => {
    if (animation.state.isPlaying) {
      animation.pause();
    } else {
      animation.play();
    }
  }, [animation]);

  const handleStop = React.useCallback(() => {
    animation.stop();
  }, [animation]);

  const handleLoopToggle = React.useCallback(() => {
    animation.setLoop(!animation.state.loop);
  }, [animation]);

  if (!isVisible) {
    return (
      <div className="animation-bottom-panel animation-bottom-panel--hidden">
        <Button
          onSelect={onToggle}
          className="animation-toggle-btn"
          title={t("animation.showTimeline")}
        >
          ⏱️
        </Button>
      </div>
    );
  }

  return (
    <div className={clsx("animation-bottom-panel", {
      "animation-bottom-panel--collapsed": isCollapsed,
    })}>
      {/* Panel Header */}
      <div className="animation-bottom-panel__header">
        <div className="animation-bottom-panel__title">
          <span className="panel-icon">⏱️</span>
          <span className="panel-title">{t("animation.timeline")}</span>
        </div>
        
        <div className="animation-bottom-panel__controls">
          {/* Quick Playback Controls */}
          <div className="quick-controls">
            <Button
              onSelect={handlePlayPause}
              className={clsx("play-btn", { playing: animation.state.isPlaying })}
              title={animation.state.isPlaying ? t("animation.pause") : t("animation.play")}
            >
              {animation.state.isPlaying ? "⏸" : "▶"}
            </Button>
            <Button
              onSelect={handleStop}
              title={t("animation.stop")}
            >
              ⏹
            </Button>
            <Button
              onSelect={handleLoopToggle}
              className={clsx("loop-btn", { active: animation.state.loop })}
              title={t("animation.loop")}
            >
              🔄
            </Button>
          </div>

          {/* Time Display */}
          <div className="time-display">
            <span className="current-time">{formatTime(animation.state.currentTime)}</span>
            <span className="time-separator">/</span>
            <span className="total-time">{formatTime(animation.state.timeline.duration)}</span>
          </div>

          {/* Panel Controls */}
          <div className="panel-controls">
            <Button
              onSelect={() => setIsCollapsed(!isCollapsed)}
              className="collapse-btn"
              title={isCollapsed ? t("animation.expand") : t("animation.collapse")}
            >
              {isCollapsed ? "⬆" : "⬇"}
            </Button>
            <Button
              onSelect={onToggle}
              className="close-btn"
              title={t("animation.hideTimeline")}
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Panel Content */}
      {!isCollapsed && (
        <div className="animation-bottom-panel__content">
          <AnimationTimelineComponent
            timeline={animation.state.timeline}
            onTimelineChange={handleTimelineChange}
            onTimeChange={handleTimeChange}
            onTrackChange={handleTrackChange}
            onKeyframeChange={handleKeyframeChange}
            onKeyframeAdd={handleKeyframeAdd}
            onKeyframeRemove={handleKeyframeRemove}
          />
        </div>
      )}
    </div>
  );
};
