import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { useI18n } from "../i18n";
import { useUIAppState } from "../context/ui-appState";
// import { useExcalidrawSetAppState } from "./App";
import { getSelectedElements } from "@excalidraw/element";
import { Island } from "./Island";
// import { Section } from "./Section";
import Stack from "./Stack";
import { Button } from "./Button";
// import { ColorPicker } from "./ColorPicker/ColorPicker";
import { type AnimationProperty } from "@excalidraw/element/animationTypes";
import { formatTime } from "@excalidraw/element/animationUtils";

import "./AnimationPositionPanel.scss";

interface AnimationPositionPanelProps {
  currentTime: number;
  timelineId: string;
  onAddKeyframe: (elementId: string, property: AnimationProperty, value: any) => void;
  onUpdateKeyframe: (keyframeId: string, updates: any) => void;
  onRemoveKeyframe: (keyframeId: string) => void;
  selectedElementId?: string;
}

export const AnimationPositionPanel: React.FC<AnimationPositionPanelProps> = ({
  currentTime,
  timelineId,
  onAddKeyframe,
  onUpdateKeyframe,
  onRemoveKeyframe,
  selectedElementId,
}) => {
  const { t } = useI18n();
  const appState = useUIAppState();
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [opacity, setOpacity] = useState(1);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(1);

  const selectedElements = getSelectedElements([], { selectedElementIds: appState.selectedElementIds });
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  // Update values when selected element changes
  React.useEffect(() => {
    if (selectedElement) {
      setPosition({ x: selectedElement.x, y: selectedElement.y });
      setRotation(selectedElement.angle);
      setOpacity(selectedElement.opacity);
      setStrokeColor(selectedElement.strokeColor);
      setBackgroundColor(selectedElement.backgroundColor);
      setStrokeWidth(selectedElement.strokeWidth);
    }
  }, [selectedElement]);

  const handleAddKeyframe = useCallback((property: AnimationProperty, value: any) => {
    if (selectedElement) {
      onAddKeyframe(selectedElement.id, property, value);
    }
  }, [selectedElement, onAddKeyframe]);

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    const newPosition = { ...position, [axis]: value };
    setPosition(newPosition);
  }, [position]);

  const handleRotationChange = useCallback((value: number) => {
    setRotation(value);
  }, []);

  const handleScaleChange = useCallback((axis: 'x' | 'y', value: number) => {
    const newScale = { ...scale, [axis]: value };
    setScale(newScale);
  }, [scale]);

  const handleOpacityChange = useCallback((value: number) => {
    setOpacity(value);
  }, []);

  const handleStrokeColorChange = useCallback((color: string) => {
    setStrokeColor(color);
  }, []);

  const handleBackgroundColorChange = useCallback((color: string) => {
    setBackgroundColor(color);
  }, []);

  const handleStrokeWidthChange = useCallback((value: number) => {
    setStrokeWidth(value);
  }, []);

  if (!selectedElement) {
    return (
      <Island className="animation-position-panel">
        <div className="animation-section">
          <h3>{t("animation.positionSettings")}</h3>
          <div className="animation-position-panel__no-selection">
            {t("animation.selectElementToAnimate")}
          </div>
        </div>
      </Island>
    );
  }

  return (
    <Island className="animation-position-panel">
      <div className="animation-section">
        <h3>{t("animation.positionSettings")}</h3>
        <Stack.Col gap={4}>
          {/* Current Time Display */}
          <div className="animation-position-panel__time">
            <label>{t("animation.currentTime")}:</label>
            <span className="time-display">{formatTime(currentTime)}</span>
          </div>

          {/* Position Controls */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.position")}</h4>
            <div className="position-controls">
              <div className="position-control">
                <label>X:</label>
                <input
                  type="number"
                  value={position.x}
                  onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                  min={-10000}
                  max={10000}
                  step={1}
                  className="number-input"
                />
                <Button
                  onSelect={() => handleAddKeyframe('position', position)}
                  className="add-keyframe-btn"
                  title={t("animation.addKeyframe")}
                >
                  +
                </Button>
              </div>
              <div className="position-control">
                <label>Y:</label>
                <input
                  type="number"
                  value={position.y}
                  onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                  min={-10000}
                  max={10000}
                  step={1}
                  className="number-input"
                />
                <Button
                  onSelect={() => handleAddKeyframe('position', position)}
                  className="add-keyframe-btn"
                  title={t("animation.addKeyframe")}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.rotation")}</h4>
            <div className="rotation-control">
              <input
                type="number"
                value={rotation}
                onChange={(e) => handleRotationChange(parseFloat(e.target.value) || 0)}
                min={-360}
                max={360}
                step={1}
                className="number-input"
                placeholder="°"
              />
              <Button
                onSelect={() => handleAddKeyframe('rotation', rotation)}
                className="add-keyframe-btn"
                title={t("animation.addKeyframe")}
              >
                +
              </Button>
            </div>
          </div>

          {/* Scale Controls */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.scale")}</h4>
            <div className="scale-controls">
              <div className="scale-control">
                <label>X:</label>
                <input
                  type="number"
                  value={scale.x}
                  onChange={(e) => handleScaleChange('x', parseFloat(e.target.value) || 1)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="number-input"
                />
                <Button
                  onSelect={() => handleAddKeyframe('scale', scale)}
                  className="add-keyframe-btn"
                  title={t("animation.addKeyframe")}
                >
                  +
                </Button>
              </div>
              <div className="scale-control">
                <label>Y:</label>
                <input
                  type="number"
                  value={scale.y}
                  onChange={(e) => handleScaleChange('y', parseFloat(e.target.value) || 1)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="number-input"
                />
                <Button
                  onSelect={() => handleAddKeyframe('scale', scale)}
                  className="add-keyframe-btn"
                  title={t("animation.addKeyframe")}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Opacity Control */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.opacity")}</h4>
            <div className="opacity-control">
              <input
                type="number"
                value={opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value) || 1)}
                min={0}
                max={1}
                step={0.01}
                className="number-input"
              />
              <Button
                onSelect={() => handleAddKeyframe('opacity', opacity)}
                className="add-keyframe-btn"
                title={t("animation.addKeyframe")}
              >
                +
              </Button>
            </div>
          </div>

          {/* Stroke Color Control */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.strokeColor")}</h4>
            <div className="color-control">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => handleStrokeColorChange(e.target.value)}
                className="color-input"
              />
              <Button
                onSelect={() => handleAddKeyframe('strokeColor', strokeColor)}
                className="add-keyframe-btn"
                title={t("animation.addKeyframe")}
              >
                +
              </Button>
            </div>
          </div>

          {/* Background Color Control */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.backgroundColor")}</h4>
            <div className="color-control">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="color-input"
              />
              <Button
                onSelect={() => handleAddKeyframe('backgroundColor', backgroundColor)}
                className="add-keyframe-btn"
                title={t("animation.addKeyframe")}
              >
                +
              </Button>
            </div>
          </div>

          {/* Stroke Width Control */}
          <div className="animation-position-panel__section">
            <h4>{t("animation.strokeWidth")}</h4>
            <div className="stroke-width-control">
              <input
                type="number"
                value={strokeWidth}
                onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value) || 1)}
                min={1}
                max={100}
                step={1}
                className="number-input"
              />
              <Button
                onSelect={() => handleAddKeyframe('strokeWidth', strokeWidth)}
                className="add-keyframe-btn"
                title={t("animation.addKeyframe")}
              >
                +
              </Button>
            </div>
          </div>
        </Stack.Col>
      </div>
    </Island>
  );
};
