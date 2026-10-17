import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// --- Mock Data ---
const earningsData = [
  { date: "01/02", amount: 18000 },
  { date: "02/02", amount: 22000 },
  { date: "03/02", amount: 19000 },
  { date: "04/02", amount: 16000 },
  { date: "05/02", amount: 24000 },
  { date: "06/02", amount: 28000 },
  { date: "07/02", amount: 50000 },
  { date: "08/02", amount: 44000 },
  { date: "09/02", amount: 52000 },
  { date: "10/02", amount: 60000 },
  { date: "11/02", amount: 58000 },
  { date: "12/02", amount: 72000 },
];

interface EarningsStatChartProps {
    totalEarnings?: number;
    data?: { date: string; amount: number }[];
    onViewAll?: () => void; // optional now
  }

  interface PeakLabelProps {
    viewBox?: {
      x: number;
      y: number;
    };
    value?: number;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; name?: string; [key: string]: any }>;
    label?: string;
  }

// --- Custom Tooltip ---
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const dateLabel = label;
  
      return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <p className="font-semibold">NGN {value?.toLocaleString()}</p>
          <p className="text-gray-400">{dateLabel}</p>
        </div>
      );
    }
  
    return null;
  };
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
//         <p className="font-semibold">
//           NGN {payload[0].value.toLocaleString()}
//         </p>
//         <p className="text-gray-400">{label}</p>
//       </div>
//     );
//   }
//   return null;
// };

// --- Peak Label ---
const PeakLabel: React.FC<PeakLabelProps> = ({ viewBox, value }) => {
    if (!viewBox) return null;
  
    const { x, y } = viewBox;
  
    return (
      <g>
        <rect
          x={x - 44}
          y={y - 36}
          width={88}
          height={24}
          rx={12}
          fill="#1a1a1a"
        />
        <text
          x={x}
          y={y - 20}
          textAnchor="middle"
          fill="white"
          fontSize={11}
          fontWeight={600}
        >
          NGN {Number(value).toLocaleString()}
        </text>
      </g>
    );
  };

// --- Main Component ---
export default function EarningsStatChart({
  totalEarnings = 80000,
  data = earningsData,
  onViewAll,
}: EarningsStatChartProps) {
  const [activeIndex, setActiveIndex] = useState(null);

  const peakValue = Math.max(...data.map((d) => d.amount));
  const peakDate = data.find((d) => d.amount === peakValue)?.date;

  return (
    <div className="bg-white rounded-2xl p-6 w-full font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            My Earnings Stat
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your rewards and see how much you've earned so far.
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm text-gray-700 font-medium border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          View all earnings
          <span className="text-base">→</span>
        </button>
      </div>

      {/* Total */}
      <div className="mt-4 mb-2">
        <div className="inline-flex flex-col">
          <span className="text-2xl font-bold text-gray-900">
            NGN {totalEarnings.toLocaleString()}.00
          </span>
          <span className="mt-1 text-[11px] text-pink-600 bg-pink-50 border border-pink-200 rounded-full px-2 py-0.5 w-fit font-medium">
            total earnings
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9a8d4" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#fce7f3" stopOpacity={0.05} />
              </linearGradient>

              {/* Optional gradient (unused but kept) */}
              <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#fef3c7" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />

            <YAxis hide />

            <Tooltip content={<CustomTooltip />} cursor={false} />

            {/* Peak reference line */}
            {peakDate && (
              <ReferenceLine
                x={peakDate}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={<PeakLabel value={peakValue} />}
              />
            )}

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#f472b6"
              strokeWidth={2.5}
              fill="url(#pinkGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#f472b6",
                stroke: "white",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}