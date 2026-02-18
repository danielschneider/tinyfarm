function Item({ item, onClick }) {
  return React.createElement(
    "div",
    {
      className: "entity",
      style: { left: item.x + "px", top: item.y + "px" },
      onClick: () => onClick(item.id)
    },
    item.type
  );
}