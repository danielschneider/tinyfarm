// Coin component that appears randomly and gives score points
export function Coin({ coin, onClick }) {
  return React.createElement(
    "div",
    {
      className: "coin entity",
      style: { left: `${coin.x}px`, top: `${coin.y}px` },
      onClick: () => onClick(coin.id)
    },
    "💰"
  );
}
