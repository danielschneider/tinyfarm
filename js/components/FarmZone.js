function FarmZone({ x, y }) {
  return React.createElement(
    "div",
    {
      className: "farm-zone",
      style: { left: x + "px", top: y + "px" }
    },
    "🏠"
  );
}