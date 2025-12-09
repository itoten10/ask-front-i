import { Search, Menu, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md h-16">
      <div className="container mx-auto flex h-full items-center px-4 justify-between">
        {/* 左側：ロゴエリア（スマホ用のメニューボタン含む） */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-bold opacity-90">下妻第一高校</span>
            <span className="text-xl font-black tracking-widest">カタリバ</span>
          </div>
        </div>

        {/* 中央：検索バー */}
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

        {/* 右側：アイコン */}
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
             <Bell className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </header>
  );
}