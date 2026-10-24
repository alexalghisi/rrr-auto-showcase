import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { rateCar } from "@/lib/ratings.functions";
import { cn } from "@/lib/utils";

type RatingSummaryProps = {
  average: number;
  count: number;
  className?: string;
};

export function RatingSummary({ average, count, className }: RatingSummaryProps) {
  const rounded = Math.round(average);

  return (
    <div className={cn("flex items-center gap-2", className)} aria-label={`${average.toFixed(1)} din 5 stele, ${count} evaluări`}>
      {count > 0 && <span className="font-display text-sm font-bold tabular-nums">{average.toFixed(1)}</span>}
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={cn(
              "size-4",
              value <= rounded ? "fill-rating text-rating" : "fill-muted text-border",
            )}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        {count === 0 ? "Fără evaluări încă" : count === 1 ? "1 evaluare" : `${count} evaluări`}
      </span>
    </div>
  );
}

type CarRatingProps = RatingSummaryProps & {
  carSlug: string;
};

export function CarRating({ carSlug, average, count, className }: CarRatingProps) {
  const submitRating = useServerFn(rateCar);
  const [summary, setSummary] = useState({ average, count });
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(`bremen-rating:${carSlug}`));
    if (stored >= 1 && stored <= 5) setSelected(stored);
  }, [carSlug]);

  const vote = async (rating: number) => {
    if (saving) return;
    setSaving(true);
    try {
      let voterKey = window.localStorage.getItem("bremen-rating-voter");
      if (!voterKey) {
        voterKey = window.crypto.randomUUID();
        window.localStorage.setItem("bremen-rating-voter", voterKey);
      }
      const result = await submitRating({ data: { carSlug, voterKey, rating } });
      setSelected(rating);
      setSummary(result);
      window.localStorage.setItem(`bremen-rating:${carSlug}`, String(rating));
      toast.success("Evaluarea ta a fost salvată.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Evaluarea nu a putut fi salvată.");
    } finally {
      setSaving(false);
    }
  };

  const active = hovered || selected;

  return (
    <div className={cn("border-t border-border pt-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold">Evaluează această mașină</p>
          <RatingSummary average={summary.average} count={summary.count} className="mt-1.5" />
        </div>
        <div className="flex items-center" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="icon"
              disabled={saving}
              aria-label={`${value} ${value === 1 ? "stea" : "stele"}`}
              aria-pressed={selected === value}
              title={`Acordă ${value} ${value === 1 ? "stea" : "stele"}`}
              onMouseEnter={() => setHovered(value)}
              onFocus={() => setHovered(value)}
              onBlur={() => setHovered(0)}
              onClick={() => void vote(value)}
              className="size-10 p-0"
            >
              <Star className={cn("size-6", value <= active ? "fill-rating text-rating" : "fill-muted text-border")} />
            </Button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Evaluări oferite de vizitatorii Bremen Auto.</p>
    </div>
  );
}
