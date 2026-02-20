const SHOW_DEBUG_INFO = false; // Set to false to hide debug info

function Item({ item, onClick }) {
  return React.createElement(
    "div",
    {
      className: "entity",
      style: { left: item.x + "px", top: item.y + "px" },
      onClick: () => onClick(item.id)
    },
    item.type,
    SHOW_DEBUG_INFO && React.createElement(
      "div",
      {
        style: {
          fontSize: '10px',
          color: 'red',
          position: 'absolute',
          top: '-15px',
          left: '0',
          backgroundColor: 'white',
          padding: '1px 3px',
          borderRadius: '2px'
        }
      },
      `ID: ${item.id}`
    )
  );
}