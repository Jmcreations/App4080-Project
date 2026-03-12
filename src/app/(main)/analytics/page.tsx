"use client";

import { useAssignments } from "@/hooks/useAssignments";
import { useStudySessions } from "@/hooks/useStudySessions";
import Card from "@/components/ui/Card";
import DbIndicator from "@/components/ui/DbIndicator";
import { calcBias } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const weeklyTrend = [
  { week: "Week 1", hours: 34 },{ week: "Week 2", hours: 41 },{ week: "Week 3", hours: 37 },
  { week: "Week 4", hours: 45 },{ week: "Week 5", hours: 39 },{ week: "Week 6", hours: 47 },
];

export default function AnalyticsPage() {
  const { assignments, isLoading: aLoading } = useAssignments();
  const { sessions, totalPlanned, totalActual, isLoading: sLoading } = useStudySessions();
  const isLoading = aLoading || sLoading;
  const bias = calcBias(totalPlanned, totalActual);

  const deadlineMap: Record<string, typeof assignments> = {};
  (assignments ?? []).filter(a => a.status !== "completed").forEach(a => {
    deadlineMap[a.deadline] = [...(deadlineMap[a.deadline] ?? []), a];
  });
  const collisions = Object.entries(deadlineMap).filter(([, items]) => (items ?? []).length > 1).slice(0, 3);

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <DbIndicator status={isLoading ? "loading" : "live"} />
      </div>
      <p className="text-gray-500 mb-6">Insights into your workload patterns and productivity</p>

      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4">Weekly Workload Trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyTrend} barSize={80}>
            <CartesianGrid vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} domain={[20, 55]} />
            <Tooltip />
            <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="bg-indigo-50 rounded-lg px-4 py-2.5 text-sm text-indigo-700 mt-3">
          Insight: Average weekly study hours: {totalPlanned > 0 ? (totalPlanned / 6).toFixed(1) : "41.3"}h
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card>
          <h2 className="text-base font-bold mb-4">Deadline Collisions</h2>
          {isLoading ? <p className="text-gray-400 text-sm">Loading...</p>
            : collisions.length === 0 ? <p className="text-gray-400 text-sm">No deadline collisions detected 🎉</p>
            : collisions.map(([deadline, items], i) => (
              <div key={deadline} className={`rounded-lg px-3.5 py-3 mb-3 border ${i === 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                <p className="font-bold text-sm mb-1.5">{deadline}</p>
                {(items ?? []).map(item => <p key={item._id} className="text-sm mb-0.5">{item.title}</p>)}
                <p className="font-semibold text-sm mt-1.5">{(items ?? []).reduce((s, a) => s + parseInt(a.hours), 0)}h total work</p>
              </div>
            ))
          }
          <p className="text-xs text-gray-400 mt-2">Recommendation: Start high-priority tasks earlier</p>
        </Card>

        <Card>
          <h2 className="text-base font-bold mb-4">Estimation Accuracy</h2>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Overall Bias</span>
            <span className={`font-semibold ${bias > 0 ? "text-orange-500" : "text-green-600"}`}>{bias > 0 ? "+" : ""}{bias}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mb-1.5">
            <div className={`h-full rounded-full ${bias > 0 ? "bg-orange-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, Math.abs(bias))}%` }} />
          </div>
          <p className="text-xs text-gray-400 mb-4">{bias > 0 ? `You underestimate by ${bias}%` : bias < 0 ? `You overestimate by ${Math.abs(bias)}%` : "Your estimates are accurate!"}</p>
          <p className="text-sm font-semibold mb-2">Sessions Summary</p>
          {[["Sessions logged",(sessions??[]).length],["Total planned",totalPlanned+"h"],["Total actual",totalActual+"h"]].map(([k,v]) => (
            <div key={k as string} className="flex justify-between text-sm mb-1.5">
              <span>{k}</span><span className="font-semibold">{v}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-bold mb-4">Workload Volatility Index</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-2xl font-extrabold mb-1">Low</p>
            <p className="text-xs text-gray-400 mb-2">Current Status</p>
            <p className="text-xs text-green-600">Your workload is fairly consistent week-to-week</p>
          </div>
          {[["4.2 hours","Std Deviation"],["48 hours","Peak Week"],["35 hours","Lightest Week"]].map(([v,l]) => (
            <div key={l} className="text-center p-5">
              <p className="text-3xl font-extrabold mb-1">{v}</p>
              <p className="text-xs text-gray-400">{l}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}