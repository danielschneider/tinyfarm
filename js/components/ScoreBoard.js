export function ScoreBoard({ level, score, bonus, combo, highScore }) {
  return React.createElement(
    "div",
    { className: "scoreboard" },
    React.createElement("div", null, "Level: " + level),
    React.createElement("div", null, "Score: " + score),
    React.createElement("div", null, "High Score: " + highScore),
    combo > 1 && React.createElement("div", { className: "combo" }, "Combo: " + combo + "x!"),
    bonus > 0 &&
      React.createElement("div", null, "Time Bonus: +" + bonus)
  );
}