function Farmer({ x, y, carrying }) {
  return React.createElement(
    "div",
    {
      className: "entity farmer",
      style: { left: x + "px", top: y + "px" }
    },
    carrying 
      ? React.createElement(
          "span",
          { className: "farmer-with-item" },
          React.createElement("span", { className: "farmer-emoji" }, "👨‍🌾"),
          React.createElement("span", { className: "carried-item" }, carrying)
        )
      : "👨‍🌾"
  );
}