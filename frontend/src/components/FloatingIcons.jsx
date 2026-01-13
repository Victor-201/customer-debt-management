import { useEffect } from "react";

const icons = ["🌹", "🌷", "🫧", "🌸", "🌼", "💮"];

const FloatingIcons = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const icon = document.createElement("div");
      icon.className = "floating-icon";
      icon.textContent =
        icons[Math.floor(Math.random() * icons.length)];

      icon.style.left = Math.random() * 100 + "vw";
      icon.style.fontSize =
        Math.random() * 20 + 18 + "px";
      icon.style.animationDuration =
        Math.random() * 10 + 15 + "s";

      document.body.appendChild(icon);

      setTimeout(() => {
        icon.remove();
      }, 25000);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default FloatingIcons;
