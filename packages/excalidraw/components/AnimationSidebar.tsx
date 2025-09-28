import React from "react";
import clsx from "clsx";
import { t } from "../i18n";
import { useUIAppState } from "../context/ui-appState";
import { useExcalidrawSetAppState } from "./App";
import { Sidebar } from "./Sidebar/Sidebar";
import { AnimationPositionPanel } from "./AnimationPositionPanel";
import { AnimationTimelineComponent } from "./AnimationTimeline";
import { useAnimation } from "./AnimationManager";
import { createTrack } from "@excalidraw/element/animationUtils";
import { type AnimationProperty } from "@excalidraw/element/animationTypes";

import "./AnimationSidebar.scss";

const ANIMATION_SIDEBAR_TAB = "animation" as const;

export const AnimationSidebar: React.FC = () => {
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const animation = useAnimation();

  const handleAddKeyframe = React.useCallback((elementId: string, property: AnimationProperty, value: any) => {
    // Find or create track for this element and property
    let track = animation.state.timeline.tracks.find(
      t => t.elementId === elementId && t.property === property
    );

    if (!track) {
      // Create new track
      track = createTrack(elementId, property);
      animation.addTrack(elementId, property);
    }

    // Add keyframe to the track
    animation.addKeyframe(track.id, {
      time: animation.state.currentTime,
      elementId,
      property,
      value,
    });
  }, [animation]);

  const handleUpdateKeyframe = React.useCallback((keyframeId: string, updates: any) => {
    // Find the keyframe and update it
    const track = animation.state.timeline.tracks.find(t => 
      t.keyframes.some(kf => kf.id === keyframeId)
    );
    
    if (track) {
      const keyframe = track.keyframes.find(kf => kf.id === keyframeId);
      if (keyframe) {
        animation.updateKeyframe({ ...keyframe, ...updates });
      }
    }
  }, [animation]);

  const handleRemoveKeyframe = React.useCallback((keyframeId: string) => {
    animation.removeKeyframe(keyframeId);
  }, [animation]);

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

  return (
    <Sidebar
      name="animation"
      className="animation-sidebar"
      docked={false}
    >
      <Sidebar.Tabs>
        <Sidebar.Header>
          <Sidebar.TabTriggers>
            <Sidebar.TabTrigger tab="position">
              <div className="tab-icon">⚙️</div>
              <span className="tab-label">{t("animation.positionSettings")}</span>
            </Sidebar.TabTrigger>
            <Sidebar.TabTrigger tab="timeline">
              <div className="tab-icon">⏱️</div>
              <span className="tab-label">{t("animation.timeline")}</span>
            </Sidebar.TabTrigger>
          </Sidebar.TabTriggers>
        </Sidebar.Header>
        
        <Sidebar.Tab tab="position">
          <AnimationPositionPanel
            currentTime={animation.state.currentTime}
            timelineId={animation.state.timeline.id}
            onAddKeyframe={handleAddKeyframe}
            onUpdateKeyframe={handleUpdateKeyframe}
            onRemoveKeyframe={handleRemoveKeyframe}
            selectedElementId={animation.state.selectedElementId}
          />
        </Sidebar.Tab>
        
        <Sidebar.Tab tab="timeline">
          <AnimationTimelineComponent
            timeline={animation.state.timeline}
            onTimelineChange={handleTimelineChange}
            onTimeChange={handleTimeChange}
            onTrackChange={handleTrackChange}
            onKeyframeChange={handleKeyframeChange}
            onKeyframeAdd={handleKeyframeAdd}
            onKeyframeRemove={handleKeyframeRemove}
          />
        </Sidebar.Tab>
      </Sidebar.Tabs>
    </Sidebar>
  );
};
