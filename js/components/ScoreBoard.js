function ScoreBoard({ level, score, bonus }) {
  return React.createElement(
    "div",
    { className: "scoreboard" },
    React.createElement("div", null, "Level: " + level),
    React.createElement("div", null, "Score: " + score),
    bonus > 0 &&
      React.createElement("div", null, "Time Bonus: +" + bonus)
  );
}