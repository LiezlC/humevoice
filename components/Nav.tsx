"use client";

import { Button } from "./ui/button";
import { Moon, Sun, Briefcase, BarChart3 } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export const Nav = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={"fixed top-0 left-0 right-0 px-4 py-2 flex items-center justify-between h-14 z-50 bg-background/80 backdrop-blur-sm border-b"}
    >
      <div className="flex items-center gap-2">
        <Briefcase className="size-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">Mozambique Labour Voice</span>
          <span className="text-xs text-muted-foreground leading-none mt-0.5">Industrial Relations AI Agent</span>
        </div>
      </div>
      
      <div className={"flex items-center gap-2"}>
        <Link href="/dashboard">
          <Button
            variant={"outline"}
            className={"flex items-center gap-1.5"}
          >
            <BarChart3 className={"size-4"} />
            <span>Dashboard</span>
          </Button>
        </Link>

        <Button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          variant={"ghost"}
          className={"flex items-center gap-1.5 rounded-full"}
        >
          <span>
            {theme === "dark" ? (
              <Sun className={"size-4"} />
            ) : (
              <Moon className={"size-4"} />
            )}
          </span>
          <span>{theme === 'dark' ? "Light" : "Dark"} Mode</span>
        </Button>
      </div>
    </div>
  );
};
