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
  icon?: string;
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

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative group"
        // ★修正: 余計な px-12 は削除。これで下のグリッドと幅が揃います。
      >
        <CarouselContent className="-ml-4">
          {React.Children.map(children, (child) => (
            <CarouselItem className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="h-full p-1">
                {child}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* 
           ★修正ポイント: ボタンを内側に配置 (Overlay)
           - left-2 / right-2 : カードの内側端に配置
           - z-10 : カードより前面に表示
           - bg-white/90 : 背景を少し透過させて圧迫感を減らす
           - shadow-md : 浮かせて視認性を確保
        */}
        <CarouselPrevious 
          className="hidden md:flex left-2 w-10 h-10 border border-slate-200 bg-white/90 text-slate-700 hover:bg-primary hover:text-white hover:border-primary shadow-md transition-all z-10" 
        />
        <CarouselNext 
          className="hidden md:flex right-2 w-10 h-10 border border-slate-200 bg-white/90 text-slate-700 hover:bg-primary hover:text-white hover:border-primary shadow-md transition-all z-10" 
        />

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