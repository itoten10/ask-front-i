"use client";

import { Search, Menu, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/Sidebar";
import { useState } from "react";

interface HeaderProps {
  onNavigate?: (view: "home" | "thanks") => void;
  badgeCount?: number;
  userName?: string;
  userAvatar?: string;
  userRole?: "student" | "teacher";
}

export function Header({ onNavigate, badgeCount = 0, userName, userAvatar, userRole = "student" }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMobileNavigate = (view: "home" | "thanks") => {
    if (onNavigate) {
      onNavigate(view);
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md h-16">
      <div className="container mx-auto flex h-full items-center px-4 justify-between">
        
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-white/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">メニューを開く</span>
                {badgeCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border border-primary ring-1 ring-white" />
                )}
              </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="p-0 w-[280px]">
              <SheetTitle className="sr-only">ナビゲーションメニュー</SheetTitle>
              <SidebarContent 
                onNavigate={handleMobileNavigate} 
                badgeCount={badgeCount}
                userName={userName}
                userAvatar={userAvatar}
                userRole={userRole}
              />
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-bold opacity-90">下妻第一高校</span>
            <span className="text-xl font-black tracking-widest">カタリバ</span>
          </div>
          <div className="md:hidden flex flex-col leading-tight">
             <span className="text-xs font-bold opacity-90">下妻一高</span>
             <span className="text-lg font-black tracking-widest">カタリバ</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
            <Input
              type="search"
              placeholder="検索"
              className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 pl-9 focus-visible:ring-white/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
             <Bell className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </header>
  );
}