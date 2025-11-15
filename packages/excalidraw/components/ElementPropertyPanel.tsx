import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { useI18n } from "../i18n";
import { useUIAppState } from "../context/ui-appState";
import { useExcalidrawSetAppState, useExcalidrawElements, useApp } from "./App";
import { getSelectedElements } from "@excalidraw/element";
import { degreesToRadians, radiansToDegrees, type Degrees } from "@excalidraw/math";
import { Island } from "./Island";
import Stack from "./Stack";
import { Button } from "./Button";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import "./ElementPropertyPanel.scss";

export const ElementPropertyPanel: React.FC = () => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const elements = useExcalidrawElements();
  const app = useApp();
  const scene = app.scene;
  
  const selectedElements = getSelectedElements(elements, { selectedElementIds: appState.selectedElementIds });
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  

  // Get current property values directly from the selected element (reactive)
  const currentPosition = selectedElement ? { x: selectedElement.x, y: selectedElement.y } : { x: 0, y: 0 };
  const currentSize = selectedElement ? { width: selectedElement.width, height: selectedElement.height } : { width: 0, height: 0 };
  const currentRotation = selectedElement ? radiansToDegrees(selectedElement.angle) : 0;
  const currentOpacity = selectedElement ? selectedElement.opacity : 100;
  const currentStrokeColor = selectedElement ? selectedElement.strokeColor : "#000000";
  const currentBackgroundColor = selectedElement ? selectedElement.backgroundColor : "transparent";
  const currentStrokeWidth = selectedElement ? selectedElement.strokeWidth : 1;

  // Local state for input values (to handle user input without immediate updates)
  const [inputPosition, setInputPosition] = useState(currentPosition);
  const [inputSize, setInputSize] = useState(currentSize);
  const [inputRotation, setInputRotation] = useState(currentRotation);
  const [inputOpacity, setInputOpacity] = useState(currentOpacity);
  const [inputStrokeColor, setInputStrokeColor] = useState(currentStrokeColor);
  const [inputBackgroundColor, setInputBackgroundColor] = useState(currentBackgroundColor);
  const [inputStrokeWidth, setInputStrokeWidth] = useState(currentStrokeWidth);


  // Update input values when selected element changes
  useEffect(() => {
    setInputPosition(currentPosition);
    setInputSize(currentSize);
    setInputRotation(currentRotation);
    setInputOpacity(currentOpacity);
    setInputStrokeColor(currentStrokeColor);
    setInputBackgroundColor(currentBackgroundColor);
    setInputStrokeWidth(currentStrokeWidth);
  }, [
    currentPosition.x,
    currentPosition.y,
    currentSize.width,
    currentSize.height,
    currentRotation,
    currentOpacity,
    currentStrokeColor,
    currentBackgroundColor,
    currentStrokeWidth
  ]);

  // Handle property updates
  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    if (!selectedElement) return;
    
    const newPosition = { ...inputPosition, [axis]: value };
    setInputPosition(newPosition);
    
    // Update the element immediately
    scene.mutateElement(selectedElement, { [axis]: value });
  }, [selectedElement, inputPosition, scene]);

  const handleSizeChange = useCallback((axis: 'width' | 'height', value: number) => {
    if (!selectedElement) return;
    
    const newSize = { ...inputSize, [axis]: value };
    setInputSize(newSize);
    
    // Update the element immediately
    scene.mutateElement(selectedElement, { [axis]: value });
  }, [selectedElement, inputSize, scene]);

  const handleRotationChange = useCallback((value: number) => {
    if (!selectedElement) return;

    setInputRotation(value);
    scene.mutateElement(selectedElement, { angle: degreesToRadians(value as Degrees) });
  }, [selectedElement, scene]);

  const handleOpacityChange = useCallback((value: number) => {
    if (!selectedElement) return;

    setInputOpacity(value);
    scene.mutateElement(selectedElement, { opacity: value });
  }, [selectedElement, scene]);

  const handleStrokeColorChange = useCallback((color: string) => {
    if (!selectedElement) return;

    setInputStrokeColor(color);
    scene.mutateElement(selectedElement, { strokeColor: color });
  }, [selectedElement, scene]);

  const handleBackgroundColorChange = useCallback((color: string) => {
    if (!selectedElement) return;

    setInputBackgroundColor(color);
    scene.mutateElement(selectedElement, { backgroundColor: color });
  }, [selectedElement, scene]);

  const handleStrokeWidthChange = useCallback((value: number) => {
    if (!selectedElement) return;

    setInputStrokeWidth(value);
    scene.mutateElement(selectedElement, { strokeWidth: value });
  }, [selectedElement, scene]);

  if (!selectedElement) {
    return (
      <Island className="element-property-panel">
        <div className="property-section">
          <h3>{t("elementProperties.title")}</h3>
          <div className="element-property-panel__no-selection">
            <div className="no-selection-icon">🎯</div>
            <p>{t("elementProperties.selectElement")}</p>
          </div>
        </div>
      </Island>
    );
  }

  return (
    <Island className="element-property-panel">
      <div className="property-section">
        <h3>{t("elementProperties.title")}</h3>
        <div className="element-info">
          <div className="element-type">
            <span className="type-icon">📐</span>
            <span className="type-name">{selectedElement.type}</span>
          </div>
          <div className="element-id">
            <span className="id-label">ID:</span>
            <span className="id-value">{selectedElement.id.slice(0, 8)}...</span>
          </div>
        </div>
        
        <div className="properties-table-container">
          <table className="properties-table">
            <tbody>
              {/* Position Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.position")}</td>
                <td className="property-controls">
                  <div className="position-controls">
                    <div className="property-control">
                      <label>X:</label>
                      <input
                        type="number"
                        value={Math.round(inputPosition.x)}
                        onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                        min={-10000}
                        max={10000}
                        step={1}
                        className="number-input"
                      />
                    </div>
                    <div className="property-control">
                      <label>Y:</label>
                      <input
                        type="number"
                        value={Math.round(inputPosition.y)}
                        onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                        min={-10000}
                        max={10000}
                        step={1}
                        className="number-input"
                      />
                    </div>
                  </div>
                </td>
              </tr>

              {/* Size Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.size")}</td>
                <td className="property-controls">
                  <div className="size-controls">
                    <div className="property-control">
                      <label>W:</label>
                      <input
                        type="number"
                        value={Math.round(inputSize.width)}
                        onChange={(e) => handleSizeChange('width', parseFloat(e.target.value) || 0)}
                        min={1}
                        max={10000}
                        step={1}
                        className="number-input"
                      />
                    </div>
                    <div className="property-control">
                      <label>H:</label>
                      <input
                        type="number"
                        value={Math.round(inputSize.height)}
                        onChange={(e) => handleSizeChange('height', parseFloat(e.target.value) || 0)}
                        min={1}
                        max={10000}
                        step={1}
                        className="number-input"
                      />
                    </div>
                  </div>
                </td>
              </tr>

              {/* Rotation Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.rotation")}</td>
                <td className="property-controls">
                  <div className="rotation-control">
                    <input
                      type="number"
                      value={Math.round(inputRotation)}
                      onChange={(e) => handleRotationChange(parseFloat(e.target.value) || 0)}
                      min={-360}
                      max={360}
                      step={1}
                      className="number-input"
                      placeholder="°"
                    />
                    <span className="degree-symbol">°</span>
                  </div>
                </td>
              </tr>

              {/* Opacity Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.opacity")}</td>
                <td className="property-controls">
                  <div className="opacity-control">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={inputOpacity}
                      onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                      className="slider-input"
                    />
                    <span className="opacity-value">{Math.round(inputOpacity)}%</span>
                  </div>
                </td>
              </tr>

              {/* Stroke Color Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.strokeColor")}</td>
                <td className="property-controls">
                  <div className="color-control">
                    <input
                      type="color"
                      value={inputStrokeColor}
                      onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={inputStrokeColor}
                      onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="color-text-input"
                      placeholder="#000000"
                    />
                  </div>
                </td>
              </tr>

              {/* Background Color Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.backgroundColor")}</td>
                <td className="property-controls">
                  <div className="color-control">
                    <input
                      type="color"
                      value={inputBackgroundColor}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={inputBackgroundColor}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="color-text-input"
                      placeholder="transparent"
                    />
                  </div>
                </td>
              </tr>

              {/* Stroke Width Row */}
              <tr className="property-row">
                <td className="property-label">{t("elementProperties.strokeWidth")}</td>
                <td className="property-controls">
                  <div className="stroke-width-control">
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={inputStrokeWidth}
                      onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value))}
                      className="slider-input"
                    />
                    <span className="stroke-width-value">{inputStrokeWidth}px</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Island>
  );
};
