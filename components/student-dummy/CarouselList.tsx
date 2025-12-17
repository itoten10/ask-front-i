// ask-front-i/components/student-dummy/CarouselList.tsx

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
import Autoplay from "embla-carousel-autoplay";
// ★追加: モーダルをインポート（パスは環境に合わせて調整してください）
import { FeatureInfoModal } from "@/components/student-dummy/FeatureInfoModal";

interface CarouselListProps {
  title: string;
  subTitle?: string;
  linkText?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
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

  // ★追加: モーダルの表示状態を管理
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

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
      {/* ★追加: モーダルコンポーネントの配置 */}
      <FeatureInfoModal 
        open={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="機能のお知らせ"
        description={
          <>
            こちらの機能は準備中です。<br />
            リスト形式で一覧が表示されるようになります。
          </>
        }
      />

      {/* ヘッダーエリア */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
              {title}
            </h2>
            {subTitle && <p className="text-xs text-slate-500 mt-1">{subTitle}</p>}
          </div>
        </div>
        <Button 
          variant="link" 
          className="text-slate-500 text-xs flex items-center gap-1 hover:text-primary"
          // ★追加: クリック時にモーダルを開く
          onClick={() => setShowComingSoon(true)}
        >
          {linkText} <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative group"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
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
        
        <CarouselPrevious 
          className="hidden md:flex left-2 w-10 h-10 border border-slate-200 bg-white/90 text-slate-700 hover:bg-primary hover:text-white hover:border-primary shadow-md transition-all z-10" 
        />
        <CarouselNext 
          className="hidden md:flex right-2 w-10 h-10 border border-slate-200 bg-white/90 text-slate-700 hover:bg-primary hover:text-white hover:border-primary shadow-md transition-all z-10" 
        />

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