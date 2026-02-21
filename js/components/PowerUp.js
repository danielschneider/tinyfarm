function PowerUp({ powerUp, onClick }) {
  return React.createElement(
    "div",
    {
      className: "entity power-up",
      style: { 
        left: powerUp.x + "px", 
        top: powerUp.y + "px"
      },
      onClick: () => onClick(powerUp.id)
    },
    powerUp.type
  );
}
