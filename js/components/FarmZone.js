export function FarmZone({ x, y, items = [], onClick }) {
  // Display stacked items in the farm
  const displayItems = items.slice(-12); // Show max 12 items in farm
  
  return React.createElement(
    "div",
    {
      className: "farm-zone",
      style: { left: x + "px", top: y + "px" },
      onClick: onClick
    },
    React.createElement(
      "div",
      { className: "farm-home" },
      "🏠"
    ),
    React.createElement(
      "div",
      { className: "farm-items" },
      displayItems.map((item, index) =>
        React.createElement(
          "span",
          { key: index, className: "farm-item", style: {
            position: 'absolute',
            left: (10 + (index % 6) * 18) + 'px',
            top: (10 + Math.floor(index / 6) * 18) + 'px',
            fontSize: '20px'
          }},
          item
        )
      )
    )
  );
}