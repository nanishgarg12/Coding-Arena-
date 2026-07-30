import { useMemo } from "react";
import { motion } from "framer-motion";

function getIntensity(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export default function Heatmap({ data = null }) {
  // Generate 52 weeks of data if none provided
  const weeks = useMemo(() => {
    const today = new Date();
    const cells = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      cells.push({
        date: key,
        count: data?.[key] ?? (Math.random() < 0.3 ? Math.floor(Math.random() * 6) : 0),
      });
    }
    // Group into weeks of 7
    const wks = [];
    for (let i = 0; i < cells.length; i += 7) {
      wks.push(cells.slice(i, i + 7));
    }
    return wks;
  }, [data]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Coding Activity</h3>
        <span className="text-xs text-slate-500">Last 52 weeks</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {days.map((d, i) => (
              <div key={i} className="h-[11px] text-[9px] text-slate-600 leading-none flex items-center">
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => {
                const intensity = getIntensity(cell.count);
                return (
                  <div
                    key={di}
                    title={`${cell.date}: ${cell.count} submissions`}
                    className={`heatmap-cell heat-${intensity}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`heatmap-cell heat-${i}`} style={{ width: 11, height: 11 }} />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  );
}
