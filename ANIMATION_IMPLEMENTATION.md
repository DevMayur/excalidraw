# Animation Timeline Implementation for Excalidraw

This document describes the implementation of an animation timeline system for Excalidraw, similar to video editing tools.

## Overview

The animation system allows users to:
- Create keyframes for element properties (position, rotation, scale, opacity, colors, stroke width)
- View and edit animations in a timeline interface
- Play, pause, and scrub through animations
- Export animated content

## Architecture

### Core Components

1. **Animation Types** (`packages/element/src/animationTypes.ts`)
   - Defines data structures for keyframes, tracks, and timelines
   - Includes easing functions and animation properties

2. **Animation Utils** (`packages/element/src/animationUtils.ts`)
   - Interpolation functions for smooth animations
   - Keyframe management utilities
   - Time formatting and parsing

3. **Animation Manager** (`packages/excalidraw/components/AnimationManager.tsx`)
   - React context for managing animation state
   - Animation playback logic
   - Element state application

4. **Position Settings Panel** (`packages/excalidraw/components/AnimationPositionPanel.tsx`)
   - UI for creating keyframes
   - Property controls (position, rotation, scale, etc.)
   - Real-time element manipulation

5. **Timeline Component** (`packages/excalidraw/components/AnimationTimeline.tsx`)
   - Visual timeline with tracks and keyframes
   - Time ruler and playhead
   - Track management

6. **Bottom Panel** (`packages/excalidraw/components/AnimationBottomPanel.tsx`)
   - Bottom-mounted timeline interface
   - Quick playback controls
   - Collapsible design

## Key Features

### Keyframe Creation
- Select an element and adjust its properties
- Click the "+" button next to any property to create a keyframe
- Keyframes are automatically placed at the current timeline position

### Timeline Interface
- **Time Ruler**: Shows time markers and current position
- **Tracks**: Each element property gets its own track
- **Keyframes**: Visual markers showing animation points
- **Playhead**: Red line indicating current time position

### Animation Playback
- **Play/Pause**: Control animation playback
- **Scrubbing**: Click on timeline to jump to specific time
- **Loop**: Option to loop animations
- **Playback Rate**: Speed control (0.1x to 5x)

### Property Animation
Supported properties:
- **Position**: X and Y coordinates
- **Rotation**: Angle in degrees
- **Scale**: X and Y scaling factors
- **Opacity**: Transparency (0-1)
- **Stroke Color**: Element stroke color
- **Background Color**: Element fill color
- **Stroke Width**: Line thickness

## Usage

### Creating an Animation

1. **Open Timeline**: Click the hamburger menu → "Timeline"
2. **Select Element**: Click on any element in the canvas
3. **Set Properties**: Adjust position, rotation, scale, etc. in the position panel
4. **Add Keyframes**: Click "+" buttons to create keyframes at current time
5. **Move Time**: Scrub the timeline to a different time
6. **Change Properties**: Modify element properties and add more keyframes
7. **Play**: Click play to see the animation

### Timeline Controls

- **Play/Pause**: ▶️/⏸️ buttons
- **Stop**: ⏹️ button (resets to beginning)
- **Loop**: 🔄 button (toggles looping)
- **Time Display**: Shows current time / total duration
- **Zoom**: +/- buttons to zoom timeline
- **Collapse**: ⬇️/⬆️ to minimize timeline

### Keyframe Management

- **Add**: Click "+" next to property controls
- **Move**: Drag keyframes along timeline
- **Delete**: Right-click keyframes (future feature)
- **Select**: Click keyframes to select them

## Technical Details

### Interpolation
The system supports multiple easing functions:
- Linear
- Ease-in
- Ease-out
- Ease-in-out
- Bounce
- Elastic

### Performance
- Uses `requestAnimationFrame` for smooth playback
- Efficient interpolation calculations
- Minimal re-renders during animation

### Data Structure
```typescript
interface AnimationKeyframe {
  id: string;
  time: number; // seconds
  elementId: string;
  property: AnimationProperty;
  value: number | string | { x: number; y: number };
  easing?: EasingFunction;
}

interface AnimationTrack {
  id: string;
  elementId: string;
  property: AnimationProperty;
  keyframes: AnimationKeyframe[];
  visible: boolean;
  locked: boolean;
}

interface AnimationTimeline {
  id: string;
  name: string;
  duration: number; // seconds
  tracks: AnimationTrack[];
  currentTime: number;
  isPlaying: boolean;
  loop: boolean;
  playbackRate: number;
}
```

## Integration

The animation system is integrated into Excalidraw through:

1. **LayerUI**: Main UI component that includes the animation bottom panel
2. **MainMenu**: Added "Timeline" menu item to open animation interface
3. **Element Types**: Extended with optional animation data
4. **Context Provider**: AnimationManager provides state management

## Future Enhancements

- **Export**: GIF/MP4 export functionality
- **Easing Curves**: Visual curve editor
- **Group Animation**: Animate multiple elements together
- **Presets**: Common animation presets
- **Keyframe Copy/Paste**: Duplicate keyframes
- **Undo/Redo**: Animation history
- **Performance**: WebGL rendering for complex animations

## Files Modified/Created

### New Files
- `packages/element/src/animationTypes.ts`
- `packages/element/src/animationUtils.ts`
- `packages/excalidraw/components/AnimationManager.tsx`
- `packages/excalidraw/components/AnimationPositionPanel.tsx`
- `packages/excalidraw/components/AnimationPositionPanel.scss`
- `packages/excalidraw/components/AnimationTimeline.tsx`
- `packages/excalidraw/components/AnimationTimeline.scss`
- `packages/excalidraw/components/AnimationBottomPanel.tsx`
- `packages/excalidraw/components/AnimationBottomPanel.scss`
- `packages/excalidraw/components/AnimationSidebar.tsx`
- `packages/excalidraw/components/AnimationSidebar.scss`

### Modified Files
- `packages/element/src/types.ts` - Added animation data to element types
- `packages/excalidraw/locales/en.json` - Added animation translations
- `packages/excalidraw/components/LayerUI.tsx` - Integrated animation components
- `packages/excalidraw/components/main-menu/DefaultItems.tsx` - Added timeline menu item

## Getting Started

To use the animation system:

1. Build the project: `yarn build`
2. Open Excalidraw
3. Create some elements (rectangles, circles, etc.)
4. Click the hamburger menu → "Timeline"
5. Select an element and start animating!

The timeline will appear at the bottom of the interface, similar to video editing software.
