// ask-front-i/components/student/CarouselList.tsx

"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CarouselListProps {
  title: string;
  subTitle?: string;
  linkText?: string;
  children: React.ReactNode;
  icon?: string; // 絵文字などを渡す用
}

export function CarouselList({ 
  title, 
  subTitle, 
  linkText = "すべて見る", 
  children,
  icon
}: CarouselListProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // カルーセルの状態を監視（ドット表示用）
  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="w-full py-4">
      {/* ヘッダーエリア */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          {icon && <span className="text-3xl">{icon}</span>}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
              {title}
            </h2>
            {subTitle && <p className="text-xs text-slate-500 mt-1">{subTitle}</p>}
          </div>
        </div>
        <Button variant="link" className="text-slate-500 text-xs flex items-center gap-1 hover:text-primary">
          {linkText} <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* カルーセル本体 */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true, // 無限ループ
        }}
        className="w-full relative group"
      >
        <CarouselContent className="-ml-4">
          {/* 子要素（カード）をここに展開 */}
          {React.Children.map(children, (child) => (
            // レスポンス幅調整：PC(lg)で3列、さらに広い画面(xl)で4列
            <CarouselItem className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="h-full p-1">
                {child}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* 左右ボタン（通常は隠してホバーで表示、あるいは常時表示など調整可） */}
        <CarouselPrevious className="hidden md:flex -left-4 w-12 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white" />
        <CarouselNext className="hidden md:flex -right-4 w-12 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white" />

        {/* ドットインジケーター */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                index + 1 === current 
                  ? "bg-primary w-4" 
                  : "bg-slate-300 hover:bg-primary/50"
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}