🚜 Game Concept: “Tiny Farm Rush”

Tech Stack:
- React for components and game logic
- Hosted on GitHub Pages as plain HTML and JS
- Only HTML symbols (emojis) for all graphics and elements

External Libraries:
- React (for UI components)
- ReactDOM (for rendering to DOM)

CDNs:
- React: https://unpkg.com/react@19/umd/react.development.js
- ReactDOM: https://unpkg.com/react-dom@19/umd/react-dom.development.js

Project Code Structure:
- index.html: Main HTML file, includes CDNs, root div for React
- js/
  - app.js: Main React app entry point, renders <Game />
  - components/
    - Game.js: Main game component, manages state and levels
    - Farmer.js: Farmer component, handles movement and animation
    - Item.js: Item component, represents spawnable items
    - FarmZone.js: Farm area component
    - ScoreBoard.js: Displays score and bonuses
  - levels.js: Array of level configurations (spawn counts, types, etc.)
- css/
  - styles.css: CSS for layout, positioning, and basic styling
- README.md: Project description and how to run locally

Bird's-eye view.
White / light green background.
Everything is just big HTML symbols (emoji).
No images. No sprites. No physics engine.

You are:

👨‍🌾 (farmer)

⸻

🧩 Core Loop (Same For Every Level)
	1.	Items spawn randomly (5–30 of them).
	2.	Player taps an item.
	3.	Farmer walks to it.
	4.	Farmer carries / pushes it to the farm area (a square at screen edge).
	5.	Score increases.
	6.	Speed bonus if you’re fast.

No fail state.
No punishment.
Just score + speed.

⸻

🗺 Layout

Top-down gridless canvas.
	•	🌾 Field background
	•	🏠 Farm area (top left or bottom center)
	•	👨‍🌾 Farmer
	•	Items randomly placed

All rendered as positioned <div> elements.

⸻

🐑 Level Structure

Level 1 – Sheep Roundup

Spawn: 5–15 🐑
Tap a 🐑 →
Farmer walks to sheep →
Sheep slides in front of farmer →
Both move to farm →
Sheep disappears into farm → +1 point

⸻

Level 2 – Corn Harvest

Spawn: 10–20 🌽
Tap 🌽 →
Farmer walks →
Corn disappears on pickup →
Farmer walks to farm →
+1 point

Corn can be faster because it doesn’t move.

⸻

Level 3 – Pig Push

Spawn: 8–25 🐖
Pigs wander slowly.
You must tap them while moving.

Adds reaction.

⸻

Level 4 – Egg Collect

Spawn: 15–30 🥚
Tiny items = higher density
More tapping strategy

⸻

🎯 Strategy Layer (Simple but Real)

You can only assign one target at a time.

So player must:
	•	Decide which item is closest
	•	Or grab clusters efficiently
	•	Think about pathing

Speed bonus:
	•	If level cleared under X seconds → bonus points

Now we have:
Reaction → tap quickly
Strategy → choose efficient path

Still zero instructions needed.

⸻

⚡ Dynamic Elements

Time Boosts:
- Each level has a target completion time (e.g., 30 seconds for level 1, increasing by 10s per level).
- If completed faster, bonus points = floor((targetTime - actualTime) / 5) * 10 (e.g., 2 points per 5 seconds saved).
- Display "Time Bonus: +X" on completion.

Entity Quantities:
- Spawn count per level: random integer between min and max.
- min = 5 + (level - 1) * 3
- max = 15 + (level - 1) * 5
- E.g., Level 1: 5-15, Level 2: 8-20, Level 3: 11-25, etc.
- Positions: random within field bounds, avoiding farm zone.

⸻

📋 Implementation Details for Developers

State Management:
- Use React hooks: useState for game state (currentLevel, score, farmer position, items array).
- Game state object: { level, farmer: {x, y, target: null, carrying: null}, items: [{id, type, x, y, moving}], score, startTime, targetTime }

Movement Algorithm:
- Farmer speed: 100 pixels/second.
- On tap item: set farmer.target = item.id, calculate path (straight line).
- Use requestAnimationFrame for smooth updates: move farmer towards target at speed, check distance < threshold to arrive.
- For carrying: if carrying, move item with farmer.
- For pigs: items have velocity, update positions randomly.

Level Progression:
- Levels array in levels.js: [{name, itemType, minSpawn, maxSpawn, targetTime, specialRules}]
- On level start: generate random spawn count, place items randomly.
- On level end: calculate time bonus, add to score, proceed to next level.

Event Handling:
- onClick on items: if no target, set target to item.id
- Animation loop: update positions, check collisions (farmer near item -> pick up, near farm -> deposit)

UI Components:
- Game: renders field, farmer, items, farm, score.
- Use absolute positioning for divs with emojis.
- No CSS animations, manual position updates.

Testing:
- Run locally: open index.html in browser.
- For GitHub Pages: push to main branch, enable Pages in repo settings.

⸻

{
  level: 1,
  farmer: { x, y, targetId: null, carrying: null },
  items: [{ id, type, x, y }],
  score: 0,
  startTime: Date.now()
}
⸻

Components
	•	<Game />
	•	<Farmer />
	•	<Item />
	•	<FarmZone />
	•	<ScoreBoard />

Movement:
	•	requestAnimationFrame
	•	Linear interpolation toward target
	•	No pathfinding needed (straight lines)

⸻

🎨 Only HTML Symbols You Can Use

Farmer:
👨‍🌾 👩‍🌾

Animals:
🐑 🐖 🐄 🐓 🐇

Crops:
🌽 🥕 🥔 🍅 🌾

Farm:
🏠 🚜 🐄🏠 (optional combo)

⸻

🧼 Why This Is Strong
	•	Not a clone of tap bubbles
	•	Thematic cohesion
	•	Expandable forever
	•	Very easy technically
	•	Fully static site friendly
	•	Perfect for iPad tapping

⸻

💡 Optional Nice Touches (Still Simple)
	•	Farmer slightly rotates toward movement direction
	•	Tiny dust emoji 💨 when moving fast
	•	Floating “+1” animation
	•	Light background music

⸻

If you want next, I can give you:
	•	A super minimal React starter structure
	•	A clean movement algorithm
	•	Or a way to structure 20+ levels without spaghetti code

This one actually has legs. 🐑🚜