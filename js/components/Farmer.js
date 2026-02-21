function Farmer({ x, y, carrying, powerUps }) {
  const hasTractor = powerUps.includes('tractor');
  const hasBackpack = powerUps.includes('backpack');
  
  return React.createElement(
    "div",
    {
      className: "entity farmer",
      style: { left: x + "px", top: y + "px" }
    },
    carrying && carrying.length > 0 
      ? React.createElement(
          "span",
          { className: "farmer-with-item" },
          React.createElement("span", { className: "farmer-emoji" }, hasTractor ? "🚜" : "👨‍🌾"),
          React.createElement("span", { className: "carried-items" },
            carrying.map((itemId, index) => 
              React.createElement("span", { 
                key: index, 
                className: "carried-item",
                style: { right: index * 15 - 15 + "px" }
              }, itemId)
            )
          )
        )
      : (hasTractor ? "🚜" : "👨‍🌾")
  );
}