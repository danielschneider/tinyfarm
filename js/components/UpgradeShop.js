import { UPGRADES, getUpgradeLevel, getUpgradeCost, canAffordUpgrade, purchaseUpgrade } from './UpgradeSystem.js';

export function UpgradeShop({ score, onUpgradePurchase }) {
  const { useState } = React;
  const [showShop, setShowShop] = useState(false);

  const upgrades = Object.entries(UPGRADES).map(([key, upgrade]) => {
    const level = getUpgradeLevel(key);
    const cost = getUpgradeCost(key, level);
    const canAfford = canAffordUpgrade(key, level, score);

    return React.createElement(
      "div",
      { key: key, className: "upgrade-item" },
      React.createElement("div", { className: "upgrade-icon" }, upgrade.icon),
      React.createElement("div", { className: "upgrade-info" },
        React.createElement("div", { className: "upgrade-name" }, upgrade.name),
        React.createElement("div", { className: "upgrade-level" }, `Level: ${level}/${upgrade.maxLevel}`),
        React.createElement("div", { className: "upgrade-description" }, upgrade.description)
      ),
      React.createElement("div", { className: "upgrade-cost" }, `Cost: ${cost}💰`),
      React.createElement("button", {
        className: `upgrade-button ${canAfford ? 'affordable' : 'not-affordable'}`,
        onClick: () => {
          if (canAfford && level < upgrade.maxLevel) {
            const newLevel = purchaseUpgrade(key, level, score, onUpgradePurchase);
          }
        },
        disabled: !canAfford || level >= upgrade.maxLevel
      }, level < upgrade.maxLevel ? "Upgrade" : "Max Level")
    );
  });

  return React.createElement(
    "div",
    null,
    React.createElement("button", {
      className: "shop-button",
      onClick: () => setShowShop(!showShop)
    }, showShop ? "Close Shop" : "Upgrade Shop 🏪"),
    showShop && React.createElement(
      "div",
      { className: "upgrade-shop" },
      React.createElement("div", { className: "shop-title" }, "Upgrade Your Farmer!"),
      upgrades
    )
  );
}
