# Animation Position Planning Document

## Overview
This document outlines the planning for implementing position-based animations in Excalidraw, where elements can have different starting and ending positions over time within animation frames.

## Current State Analysis

### Element Structure
- Each element has a unique `id` (string)
- Elements have position properties: `x`, `y`, `width`, `height`, `angle`
- Elements can be selected and their IDs accessed via `appState.selectedElementIds`

### Existing Animation System
- Timeline component exists with keyframe support
- Animation manager handles timeline state
- Position panel exists for animation controls
- Elements can be animated with properties like position, rotation, scale, opacity

## Requirements

### 1. Position Tracking Over Time
- **Starting Position**: Element's initial position at time 0
- **Ending Position**: Element's final position at the end of the animation
- **Intermediate Positions**: Keyframe positions at specific time intervals
- **Smooth Interpolation**: Calculate positions between keyframes

### 2. Frame-Based Animation
- **Frame Duration**: Define how long each frame lasts
- **Frame Rate**: FPS (frames per second) for smooth animation
- **Total Duration**: Overall animation length
- **Loop Support**: Option to repeat animation

### 3. Position Properties to Track
- **X Position**: Horizontal movement
- **Y Position**: Vertical movement
- **Rotation**: Angle changes
- **Scale**: Size changes (width/height)
- **Opacity**: Fade in/out effects

## Technical Implementation Plan

### Phase 1: Data Structure Design

#### Keyframe Structure
```typescript
interface PositionKeyframe {
  id: string;
  elementId: string;
  time: number; // Time in seconds
  position: {
    x: number;
    y: number;
    angle: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
  };
  easing?: EasingFunction;
}
```

#### Animation Track Structure
```typescript
interface PositionTrack {
  id: string;
  elementId: string;
  keyframes: PositionKeyframe[];
  duration: number;
  loop: boolean;
  playbackRate: number;
}
```

### Phase 2: UI Components

#### 1. Position Timeline View
- Visual representation of position changes over time
- Keyframe markers on timeline
- Drag-and-drop keyframe positioning
- Real-time preview of position changes

#### 2. Position Property Panel
- Input fields for X, Y coordinates
- Rotation slider/input
- Scale controls
- Opacity slider
- Easing function selector

#### 3. Keyframe Management
- Add keyframe button
- Delete keyframe functionality
- Copy/paste keyframes
- Keyframe interpolation controls

### Phase 3: Animation Engine

#### 1. Interpolation System
```typescript
interface InterpolationEngine {
  // Linear interpolation between keyframes
  interpolateLinear(start: PositionKeyframe, end: PositionKeyframe, time: number): Position;
  
  // Easing functions (ease-in, ease-out, ease-in-out)
  interpolateEased(start: PositionKeyframe, end: PositionKeyframe, time: number, easing: EasingFunction): Position;
  
  // Bezier curve interpolation for smooth paths
  interpolateBezier(keyframes: PositionKeyframe[], time: number): Position;
}
```

#### 2. Animation Playback
```typescript
interface AnimationPlayer {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  
  play(): void;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  
  // Get element position at specific time
  getElementPositionAtTime(elementId: string, time: number): Position;
}
```

### Phase 4: Integration Points

#### 1. Element Selection Integration
- When element is selected, show its animation track
- Display current position in property panel
- Allow editing of position keyframes

#### 2. Timeline Integration
- Position tracks appear as rows in timeline
- Visual representation of position changes
- Synchronized playback with other animation properties

#### 3. Export/Import Support
- Save position animations to Excalidraw format
- Export animation data for external use
- Import animation sequences

## Implementation Steps

### Step 1: Extend Animation Data Model
- [ ] Add position tracking to existing animation state
- [ ] Create keyframe data structures
- [ ] Update animation manager to handle position data

### Step 2: Create Position Timeline Component
- [ ] Design timeline UI for position tracks
- [ ] Implement keyframe visualization
- [ ] Add drag-and-drop keyframe editing

### Step 3: Build Position Property Panel
- [ ] Create input controls for position properties
- [ ] Implement real-time position updates
- [ ] Add easing function selection

### Step 4: Implement Animation Engine
- [ ] Create interpolation algorithms
- [ ] Build animation player
- [ ] Add smooth position transitions

### Step 5: Integration and Testing
- [ ] Integrate with existing timeline system
- [ ] Test with various element types
- [ ] Performance optimization
- [ ] User experience testing

## Data Flow

### 1. Element Selection
```
User selects element → Get element ID → Load animation track → Display in timeline
```

### 2. Keyframe Creation
```
User sets position → Create keyframe → Add to track → Update timeline view
```

### 3. Animation Playback
```
Play button pressed → Animation engine starts → Interpolate positions → Update element positions → Render frame
```

## File Structure

```
packages/excalidraw/components/animation/
├── PositionTimeline.tsx          # Main position timeline component
├── PositionTimeline.scss         # Timeline styling
├── PositionPropertyPanel.tsx     # Property editing panel
├── PositionKeyframe.tsx          # Individual keyframe component
├── PositionInterpolation.ts      # Interpolation algorithms
├── AnimationPlayer.ts            # Animation playback engine
└── types/
    ├── PositionKeyframe.ts       # Keyframe type definitions
    ├── PositionTrack.ts          # Track type definitions
    └── AnimationTypes.ts         # General animation types
```

## Success Criteria

### Functional Requirements
- [ ] Elements can have position keyframes at different times
- [ ] Smooth interpolation between keyframes
- [ ] Real-time preview of position changes
- [ ] Support for multiple elements animating simultaneously
- [ ] Export/import of position animations

### Performance Requirements
- [ ] Smooth 60fps animation playback
- [ ] Responsive UI during animation editing
- [ ] Efficient memory usage for large animations
- [ ] Fast keyframe interpolation

### User Experience Requirements
- [ ] Intuitive keyframe editing
- [ ] Clear visual feedback
- [ ] Easy position property editing
- [ ] Seamless integration with existing UI

## Future Enhancements

### Advanced Features
- **Path Animation**: Elements follow curved paths
- **Physics Simulation**: Gravity, bounce, spring effects
- **Motion Blur**: Visual effects during movement
- **3D Transformations**: Z-axis positioning and rotation
- **Animation Templates**: Pre-built animation presets

### Integration Opportunities
- **Collaborative Animation**: Multiple users editing animations
- **Animation Library**: Share and reuse animation sequences
- **Export Formats**: GIF, MP4, SVG animation export
- **API Integration**: Programmatic animation control

## Technical Considerations

### Performance
- Use requestAnimationFrame for smooth playback
- Implement efficient interpolation algorithms
- Cache calculated positions to avoid recalculation
- Use Web Workers for complex animations

### Memory Management
- Clean up unused keyframes
- Implement efficient data structures
- Handle large numbers of animated elements
- Optimize for mobile devices

### Browser Compatibility
- Ensure smooth animation across browsers
- Fallback for older browsers
- Progressive enhancement approach
- Test on various devices and screen sizes

## Conclusion

This planning document provides a comprehensive roadmap for implementing position-based animations in Excalidraw. The phased approach ensures systematic development while maintaining code quality and user experience. The focus on performance and integration will ensure the feature works seamlessly with the existing Excalidraw ecosystem.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Planning Phase
