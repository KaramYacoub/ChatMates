import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/UseThemeStore";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const isLight = theme === "forest";

  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        checked={!isLight}
        onChange={() => setTheme(isLight ? "light" : "forest")}
        aria-label="Toggle theme"
      />
      <Sun className="swap-on w-6 h-6 text-yellow-500" />
      <Moon className="swap-off w-6 h-6 text-green-500" />
    </label>
  );
};
export default ThemeSelector;
