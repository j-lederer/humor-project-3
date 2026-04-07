"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; icon: string; label: string }[] = [
    { value: "light", icon: "☀️", label: "Light" },
    { value: "dark", icon: "🌙", label: "Dark" },
    { value: "system", icon: "💻", label: "System" },
  ];

  return (
    <div className="flex bg-gray-200 dark:bg-slate-700 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
            theme === opt.value
              ? "bg-white dark:bg-slate-500 shadow-sm"
              : "hover:bg-gray-300 dark:hover:bg-slate-600"
          }`}
          title={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
