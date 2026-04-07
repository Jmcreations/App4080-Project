"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAssignments } from "@/hooks/useAssignments";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DbIndicator from "@/components/ui/DbIndicator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const weeklyData = [
  { day: "Mon", hours: 6 },{ day: "Tue", hours: 8 },{ day: "Wed", hours: 5 },
  { day: "Thu", hours: 9 },{ day: "Fri", hours: 7 },{ day: "Sat", hours: 4 },{ day: "Sun", hours: 3 },
];

export default function DashboardPage() {
  const { user } = useUser();
  const { assignments, isLoading } = useAssignments();

  const seedA = useMutation(api.assignments.seedAssignments);
  const seedS = useMutation(api.studySessions.seedSessions);
  useEffect(() => {
    if (user?.id) { seedA({ userId: user.id }); seedS({ userId: user.id }); }
  }, [user?.id]);

  const pending  = (assignments ?? []).filter(a => a.status !== "completed");
  const upcoming = pending.slice(0, 5);
  const riskLevel = pending.length >= 4 ? "High" : pending.length >= 2 ? "Medium" : "Low";
  const riskCfg = {
    High:   { color: "text-red-600",    bg: "bg-red-100",    icon: "🔴" },
    Medium: { color: "text-yellow-600", bg: "bg-yellow-100", icon: "⚠️" },
    Low:    { color: "text-green-600",  bg: "bg-green-100",  icon: "✅" },
  }[riskLevel];

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <DbIndicator status={isLoading ? "loading" : "live"} />
      </div>
      <p className="text-gray-500 mb-6">Welcome back, {user?.firstName}! Here&apos;s your workload overview</p>

      <div className="grid grid-cols-[320px_1fr] gap-5 mb-5">
        <Card>
          <h2 className="text-base font-bold mb-4">Upcoming Deadlines</h2>
          {isLoading ? <p className="text-gray-400 text-sm">Loading from database...</p>
            : upcoming.length === 0 ? <p className="text-gray-400 text-sm">No upcoming assignments 🎉</p>
            : upcoming.map(a => (
              <div key={a._id} className="mb-4">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm">{a.title}</span>
                  <Badge type={a.priority}>{a.priority}</Badge>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{a.course}</p>
                <p className="text-gray-400 text-xs">{a.deadline}</p>
              </div>
            ))
          }
        </Card>
        <Card>
          <h2 className="text-base font-bold mb-4">Weekly Workload</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData} barSize={50}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#EEF2FF" }} />
              <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h2 className="text-base font-bold mb-4">Risk Indicator</h2>
          <div className="flex flex-col items-center py-4">
            <div className={`w-20 h-20 rounded-full ${riskCfg.bg} flex items-center justify-center text-3xl mb-3`}>{riskCfg.icon}</div>
            <p className={`font-semibold text-base ${riskCfg.color}`}>{riskLevel}</p>
            <p className="text-gray-400 text-sm mt-1">{pending.length} assignment{pending.length !== 1 ? "s" : ""} pending</p>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-bold mb-4">Recommendations</h2>
          {[
            { title: "Start High Priority Tasks Early", desc: "Focus on high-priority assignments to avoid deadline stress." },
            { title: "Balance Your Week",               desc: "If Thursday looks heavy, shift lighter tasks to other days." },
            { title: "Take Breaks",                     desc: "Schedule 15-min breaks every 2 hours to maintain focus." },
          ].map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-lg px-4 py-2.5 mb-2.5">
              <p className="font-semibold text-sm">{r.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}