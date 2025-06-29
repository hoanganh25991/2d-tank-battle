# Tank Rotation System

## Overview
The tank rotation system allows players to independently control tank rotation and movement, providing more realistic tank controls.

## Controls

### Player 1 (Red Tank)
- **Movement**: WASD keys
  - W: Move forward in facing direction
  - S: Move backward from facing direction  
  - A: Strafe left
  - D: Strafe right
- **Rotation**: Q/E keys
  - Q: Rotate left (counterclockwise)
  - E: Rotate right (clockwise)
- **Shooting**: SPACE key

### Player 2 (Blue Tank)  
- **Movement**: Arrow keys
  - ↑: Move forward in facing direction
  - ↓: Move backward from facing direction
  - ←: Strafe left
  - →: Strafe right
- **Rotation**: Z/X keys
  - Z: Rotate left (counterclockwise)
  - X: Rotate right (clockwise)
- **Shooting**: ENTER key

## Technical Implementation

### Key Features
1. **Independent Rotation**: Tanks can rotate without moving
2. **Directional Movement**: Movement is relative to tank's facing direction
3. **Strafe Movement**: Side movement perpendicular to facing direction
4. **Smooth Rotation**: Continuous rotation at configurable speed
5. **Angle Normalization**: Keeps angles within 0-2π range

### Code Structure
```javascript
class Tank {
    constructor(x, y, color, owner) {
        // ... other properties
        this.angle = 0;                    // Current facing direction
        this.rotationSpeed = 0.1;          // Rotation speed (radians/frame)
    }
    
    update(keys, obstacles, canvasWidth, canvasHeight) {
        // Handle rotation input
        if (keys['KeyQ']) this.angle -= this.rotationSpeed;
        if (keys['KeyE']) this.angle += this.rotationSpeed;
        
        // Handle movement in facing direction
        if (keys['KeyW']) {
            newX += Math.cos(this.angle) * this.speed;
            newY += Math.sin(this.angle) * this.speed;
        }
        // ... other movement logic
    }
}
```

### Movement Mechanics
- **Forward/Backward**: Uses `Math.cos(angle)` and `Math.sin(angle)` for direction
- **Strafing**: Uses `angle ± π/2` for perpendicular movement
- **Collision Detection**: Unchanged from original implementation
- **Boundary Checking**: Unchanged from original implementation

## Configuration
- `rotationSpeed`: 0.1 radians per frame (adjustable)
- Tank movement speed: 3 pixels per frame
- Rotation is continuous while key is held

## Gameplay Impact
1. **Strategic Positioning**: Players can position for shots without changing facing
2. **Defensive Maneuvers**: Can retreat while maintaining aim
3. **Advanced Tactics**: Strafing allows for more complex movement patterns
4. **Realistic Feel**: More authentic tank-like controls