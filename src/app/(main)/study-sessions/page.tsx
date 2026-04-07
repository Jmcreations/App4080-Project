"use client";

import { useState } from "react";
import { useStudySessions } from "@/hooks/useStudySessions";
import Card from "@/components/ui/Card";
import DbIndicator from "@/components/ui/DbIndicator";
import { COURSES } from "@/constants";
import { calcAccuracy, formatDate } from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";

export default function StudySessionsPage() {
  const { sessions, isLoading, totalPlanned, totalActual, logSession, deleteSession } = useStudySessions();
  const [dbStatus, setDbStatus] = useState<"live"|"loading"|"saved">("live");
  const [form, setForm] = useState({ date: "", course: COURSES[0], planned: "", actual: "", notes: "" });

  const withStatus = async (fn: () => Promise<unknown>) => {
    setDbStatus("loading"); await fn(); setDbStatus("saved"); setTimeout(() => setDbStatus("live"), 2000);
  };

  const handleLog = () => withStatus(async () => {
    if (!form.date || !form.planned || !form.actual) return;
    await logSession({ course: form.course, date: formatDate(form.date), planned: parseFloat(form.planned), actual: parseFloat(form.actual), notes: form.notes });
    setForm({ date: "", course: COURSES[0], planned: "", actual: "", notes: "" });
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl font-bold text-gray-900">Study Sessions</h1>
        <DbIndicator status={isLoading ? "loading" : dbStatus} />
      </div>
      <p className="text-gray-500 mb-6">Log and track your study time</p>

      <div className="grid grid-cols-[320px_1fr] gap-5">
        <Card>
          <h2 className="text-base font-bold mb-5">+ Log Study Session</h2>
          {[["Date","date","date"],["Planned Hours","planned","number"],["Actual Hours","actual","number"]].map(([label, key, type]) => (
            <div key={key} className="mb-3.5">
              <label className="text-sm block mb-1">{label}</label>
              <input type={type} value={(form as Record<string,string>)[key]} min="0" step="0.5"
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          ))}
          <div className="mb-3.5">
            <label className="text-sm block mb-1">Course</label>
            <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
              {COURSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-sm block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="What did you work on? Any blockers?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-y min-h-[80px]" />
          </div>
          <button onClick={handleLog} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-indigo-700 transition-colors">
            Log Session
          </button>
          <div className="mt-5 pt-4 border-t border-gray-100">
            {[["Total Planned", totalPlanned+"h"],["Total Actual", totalActual+"h"],["Estimation Accuracy", calcAccuracy(totalPlanned, totalActual)]].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="text-base font-bold mb-4">Session History</h2>
          {isLoading ? <Card><p className="text-gray-400 text-sm">Loading from database...</p></Card>
            : (sessions ?? []).length === 0 ? <Card><p className="text-gray-400 text-sm">No sessions yet. Log your first!</p></Card>
            : (sessions ?? []).map(s => {
              const diff = +(s.actual - s.planned).toFixed(1);
              return (
                <Card key={s._id} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{s.course}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">{s.planned}h planned → {s.actual}h actual</span>
                      <button onClick={() => withStatus(() => deleteSession(s._id as Id<"studySessions">))} className="text-gray-300 hover:text-red-500 text-sm">🗑</button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mb-1.5">{s.date}</p>
                  <p className="text-sm">{s.notes}</p>
                  {diff !== 0 && <p className={`text-xs font-medium mt-1 ${diff > 0 ? "text-red-500" : "text-green-500"}`}>{diff > 0 ? `+${diff}h over` : `${diff}h under`}</p>}
                </Card>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}