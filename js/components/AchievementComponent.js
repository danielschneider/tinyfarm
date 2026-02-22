import { ACHIEVEMENTS, loadAchievements, checkAchievements } from './AchievementSystem.js';
import { getUpgradeLevel } from './UpgradeSystem.js';

export function AchievementComponent({ score, combo, level, onAchievementUnlock }) {
  const { useState, useEffect } = React;
  const [achievements, setAchievements] = useState(() => loadAchievements());
  const [showPanel, setShowPanel] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState([]);

  useEffect(() => {
    // Check for achievements on every render
    const upgrades = {
      speed: getUpgradeLevel('speed'),
      capacity: getUpgradeLevel('capacity'),
      magnet: getUpgradeLevel('magnet'),
      autoCollect: getUpgradeLevel('autoCollect')
    };

    const result = checkAchievements(achievements, score, combo, level, upgrades);
    
    if (result.unlocked.length > 0) {
      setAchievements(result.achievements);
      setRecentlyUnlocked(result.unlocked);
      
      // Show achievement notifications
      result.unlocked.forEach(key => {
        const achievement = ACHIEVEMENTS[key];
        showAchievementNotification(achievement);
        if (onAchievementUnlock) {
          onAchievementUnlock(achievement);
        }
      });
    }
  }, [score, combo, level]);

  const showAchievementNotification = (achievement) => {
    // Create floating achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const achievementList = Object.keys(achievements).map(key => {
    const achievement = achievements[key];
    return React.createElement(
      "div",
      { key: key, className: `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}` },
      React.createElement("div", { className: "achievement-icon" }, achievement.icon),
      React.createElement("div", { className: "achievement-info" },
        React.createElement("div", { className: "achievement-name" }, achievement.name),
        React.createElement("div", { className: "achievement-description" }, achievement.description)
      ),
      achievement.unlocked && React.createElement("div", { className: "achievement-unlocked" }, "✓")
    );
  });

  return React.createElement(
    "div",
    null,
    React.createElement("button", {
      className: "achievements-button",
      onClick: () => setShowPanel(!showPanel)
    }, `Achievements (${Object.values(achievements).filter(a => a.unlocked).length}/${Object.keys(achievements).length})`),
    showPanel && React.createElement(
      "div",
      { className: "achievement-panel" },
      React.createElement("div", { className: "panel-title" }, "Achievements"),
      achievementList
    )
  );
}
