'use client';
import { cn } from "@/lib/utils";
import React from "react";
import { SidebarTrigger } from "./sidebar";
import { Button } from "./button";
import { Users2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";

interface AppBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  actions?: React.ReactNode;
}

export const AppBar = React.forwardRef<
  HTMLDivElement,
  AppBarProps
>(({ className, title, actions, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between gap-4 border-b border-b-border bg-background p-4 lg:hidden",
      className
    )}
    {...props}
  >
    <SidebarTrigger />
    <h2 className="text-lg font-semibold text-center">{title}</h2>
    {actions || (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="overflow-hidden rounded-full"
            >
                <Users2 />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )}
  </div>
));

AppBar.displayName = "AppBar";
