# 2D Tank Battle Game

A browser-based 2D tank battle game built with HTML5 Canvas and JavaScript.

## Features

- **Two-player local multiplayer**
- **Real-time tank movement and shooting**
- **Obstacle-based battlefield**
- **Health system with visual indicators**
- **Collision detection**
- **Responsive design**

## Game Controls

### Player 1 (Red Tank)
- **W** - Move Up
- **A** - Move Left
- **S** - Move Down
- **D** - Move Right
- **SPACE** - Shoot

### Player 2 (Blue Tank)
- **↑** - Move Up
- **←** - Move Left
- **↓** - Move Down
- **→** - Move Right
- **ENTER** - Shoot

## Game Mechanics

- Each tank starts with 100 health points
- Each bullet hit deals 25 damage
- Tanks cannot move through obstacles or battlefield boundaries
- Bullets have a cooldown period to prevent spam
- Game ends when one player's health reaches 0

## File Structure

```
2d-tank-battle/
├── index.html          # Main HTML file
├── styles.css          # Game styling
├── game.js            # Game logic and classes
└── docs/
    ├── README.md      # This file
    └── game-flow.md   # Game flow diagram
```

## How to Play

1. Open `index.html` in your web browser
2. Use the controls above to move your tank and shoot
3. Avoid enemy bullets and obstacles
4. Reduce opponent's health to 0 to win
5. Click "Play Again" to restart

## Technical Details

- Built with HTML5 Canvas for 2D rendering
- Object-oriented JavaScript with ES6 classes
- Collision detection using AABB (Axis-Aligned Bounding Box)
- Game loop using `requestAnimationFrame` for smooth animation
- Responsive CSS Grid layout