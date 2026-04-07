"use client";

import { useAssignments } from "@/hooks/useAssignments";
import { useStudySessions } from "@/hooks/useStudySessions";
import Card from "@/components/ui/Card";
import DbIndicator from "@/components/ui/DbIndicator";
import { calcBias } from "@/lib/utils";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const MAX_RECOMMENDED_HOURS = 40;
const MAX_ASSIGNMENTS_FOR_RISK = 8; // Adjust threshold as needed entirely (e.g. 8 assignments = 100% risk)

export default function AnalyticsPage() {
  const { assignments, isLoading: aLoading } = useAssignments();
  const { sessions, totalPlanned, totalActual, isLoading: sLoading } = useStudySessions();
  const isLoading = aLoading || sLoading;
  const bias = calcBias(totalPlanned, totalActual);

  const activeAssignments = (assignments ?? []).filter(a => a.status !== "completed");
  const deadlineMap: Record<string, typeof assignments> = {};
  activeAssignments.forEach(a => {
    deadlineMap[a.deadline] = [...(deadlineMap[a.deadline] ?? []), a];
  });
  const collisions = Object.entries(deadlineMap).filter(([, items]) => (items ?? []).length > 1).slice(0, 3);
  
  const activeAssignmentsCount = activeAssignments.length;
  const assignmentRiskPercent = Math.min(100, Math.round((activeAssignmentsCount / MAX_ASSIGNMENTS_FOR_RISK) * 100));

  const { dynamicWeeklyTrend, stdDev, peakWeek, lightestWeek, avgHours } = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return { dynamicWeeklyTrend: [], stdDev: 0, peakWeek: 0, lightestWeek: 0, avgHours: 0 };
    }

    const weeklyDataMap: Record<string, number> = {};
    
    sessions.forEach(session => {
      // get Monday of the week for the session date
      const d = new Date(session.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const weekKey = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      weeklyDataMap[weekKey] = (weeklyDataMap[weekKey] || 0) + session.actual;
    });

    const sortedKeys = Object.keys(weeklyDataMap).sort((a, b) => new Date(`${a} ${new Date().getFullYear()}`).getTime() - new Date(`${b} ${new Date().getFullYear()}`).getTime());
    
    const trend = sortedKeys.map(week => {
      const hours = weeklyDataMap[week];
      const risk = Math.min(100, Math.round((hours / MAX_RECOMMENDED_HOURS) * 100));
      return { week, hours, risk };
    });

    const allHours = Object.values(weeklyDataMap);
    const peak = Math.max(...allHours);
    const lightest = Math.min(...allHours);
    const avg = allHours.reduce((a, b) => a + b, 0) / allHours.length;
    const deviation = allHours.length > 1 
      ? Math.sqrt(allHours.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / (allHours.length - 1)) 
      : 0;

    return { 
      dynamicWeeklyTrend: trend, 
      stdDev: deviation.toFixed(1), 
      peakWeek: peak, 
      lightestWeek: lightest, 
      avgHours: avg 
    };
  }, [sessions]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <DbIndicator status={isLoading ? "loading" : "live"} />
      </div>
      <p className="text-gray-500 mb-6">Insights into your workload patterns and productivity</p>

      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4">Weekly Workload & Burnout Risk Trend</h2>
        {!isLoading && dynamicWeeklyTrend.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-dashed border-gray-200">
             <p className="text-gray-500 font-medium">No study sessions logged yet</p>
             <p className="text-gray-400 text-sm mt-1">Log your first session to see your trend</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dynamicWeeklyTrend}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} domain={[0, Math.max(60, peakWeek + 10)]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#EF4444", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" name="Study Hours" dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={60} />
                <Line yAxisId="right" name="Burnout Risk %" type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: "#EF4444" }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="bg-indigo-50 rounded-lg px-4 py-2.5 text-sm text-indigo-700 mt-3">
              Insight: Average weekly study hours: {dynamicWeeklyTrend.length > 0 ? avgHours.toFixed(1) : "0.0"}h
            </div>
          </>
        )}
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
      
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4">Assignment Load Burnout Risk</h2>
        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Current active assignments: {activeAssignmentsCount}</span>
              <span className={`text-sm font-bold ${assignmentRiskPercent > 75 ? 'text-red-500' : assignmentRiskPercent > 50 ? 'text-orange-500' : 'text-green-500'}`}>
                {assignmentRiskPercent}% Risk
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-3 border border-gray-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${assignmentRiskPercent > 75 ? 'bg-red-500' : assignmentRiskPercent > 50 ? 'bg-orange-500' : 'bg-green-500'}`} 
                style={{ width: `${assignmentRiskPercent}%` }} 
              />
            </div>
            <p className="text-xs text-gray-400">
              {assignmentRiskPercent > 75 
                ? "You have a heavy assignment load. Focus on high-priority tasks and consider breaking them into smaller steps." 
                : assignmentRiskPercent > 50 
                  ? "Your workload is moderate. Keep a steady pace to prevent assignments from piling up."
                  : "Your assignment load is manageable. Great time to get ahead or take a breather!"}
            </p>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-base font-bold mb-4">Workload Volatility Index</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-2xl font-extrabold mb-1">{dynamicWeeklyTrend.length > 0 ? (Number(stdDev) < 5 ? "Low" : Number(stdDev) < 10 ? "Medium" : "High") : "N/A"}</p>
            <p className="text-xs text-gray-400 mb-2">Current Status</p>
            <p className="text-xs text-green-600">{dynamicWeeklyTrend.length > 0 ? "Your workload tracking is active" : "Log sessions to calculate volatility"}</p>
          </div>
          {[
            [`${stdDev} hours`,"Std Deviation"],
            [`${peakWeek} hours`,"Peak Week"],
            [`${lightestWeek} hours`,"Lightest Week"]
          ].map(([v,l]) => (
            <div key={l} className="text-center p-5">
              <p className="text-3xl font-extrabold mb-1">{dynamicWeeklyTrend.length > 0 ? v : "-"}</p>
              <p className="text-xs text-gray-400">{l}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}