import type { WeeklyEngagementPoint } from "@/lib/mock-data";

export interface WeeklyEngagementChartProps {
  points: WeeklyEngagementPoint[];
  changePercent: number;
}

export function WeeklyEngagementChart({
  points,
  changePercent,
}: WeeklyEngagementChartProps) {
  const peakDay = points.reduce((max, p) => (p.value > max.value ? p : max), points[0]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-level-1">
      <div className="flex items-center justify-between">
        <span className="text-label-md font-semibold tracking-wide text-slate-500 uppercase">
          Catalog Engagement Trajectory
        </span>
        <span className="font-tabular text-data-md font-semibold text-secondary-text">
          +{changePercent}% this week
        </span>
      </div>
      <div className="flex h-24 items-end gap-2 pt-2">
        {points.map((point) => {
          const isPeak = point.day === peakDay.day;
          return (
            <div
              key={point.day}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={`w-full rounded-t transition-colors group-hover:bg-primary ${
                  isPeak ? "bg-primary" : "bg-slate-200"
                }`}
                style={{ height: `${point.value}%` }}
              />
              <span
                className={`text-label-sm ${
                  isPeak ? "font-bold text-primary" : "text-slate-500"
                }`}
              >
                {point.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
