function Farmer({ x, y }) {
  return React.createElement(
    "div",
    {
      className: "entity farmer",
      style: { left: x + "px", top: y + "px" }
    },
    "👨‍🌾"
  );
}