import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => {
          setTheme(checked ? "dark" : "light");
        }}
        id="dark-mode-toggle"
      />
      <Moon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
    </div>
  );
}
