"use client";

import { useState } from "react";
import { useAssignments } from "@/hooks/useAssignments";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DbIndicator from "@/components/ui/DbIndicator";
import { COURSES, PRIORITY_OPTIONS, STATUS_OPTIONS, Priority, Status } from "@/constants";
import { Id } from "../../../../convex/_generated/dataModel";

export default function AssignmentsPage() {
  const { assignments, isLoading, addAssignment, updateStatus, deleteAssignment } = useAssignments();
  const [showModal, setShowModal] = useState(false);
  const [dbStatus, setDbStatus]   = useState<"live"|"loading"|"saved">("live");
  const [form, setForm] = useState({ title: "", desc: "", course: COURSES[0], deadline: "", hours: "", priority: "medium" as Priority, status: "pending" as Status });

  const withStatus = async (fn: () => Promise<unknown>) => {
    setDbStatus("loading"); await fn(); setDbStatus("saved"); setTimeout(() => setDbStatus("live"), 2000);
  };

  const handleAdd = () => withStatus(async () => {
    if (!form.title) return;
    await addAssignment({ ...form, hours: form.hours + "h" });
    setForm({ title: "", desc: "", course: COURSES[0], deadline: "", hours: "", priority: "medium", status: "pending" });
    setShowModal(false);
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <DbIndicator status={isLoading ? "loading" : dbStatus} />
          </div>
          <p className="text-gray-500">Manage your course assignments and deadlines</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">
          + Add Assignment
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {["Title","Course","Deadline","Est. Hours","Priority","Status",""].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400 text-sm">Loading from Convex database...</td></tr>
            ) : (assignments ?? []).length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400 text-sm">No assignments yet. Add one!</td></tr>
            ) : (
              (assignments ?? []).map((a, i) => (
                <tr key={a._id} className={i < (assignments ?? []).length - 1 ? "border-b border-gray-100" : ""}>
                  <td className="px-5 py-4"><p className="font-semibold text-sm">{a.title}</p><p className="text-gray-400 text-xs mt-0.5">{a.desc}</p></td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{a.course}</td>
                  <td className="px-5 py-4 text-sm">{a.deadline}</td>
                  <td className="px-5 py-4 text-sm">{a.hours}</td>
                  <td className="px-5 py-4"><Badge type={a.priority}>{a.priority}</Badge></td>
                  <td className="px-5 py-4">
                    <select value={a.status} onChange={e => withStatus(() => updateStatus(a._id as Id<"assignments">, e.target.value as Status))}
                      className="border-none bg-transparent text-sm cursor-pointer focus:outline-none">
                      {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => withStatus(() => deleteAssignment(a._id as Id<"assignments">))} className="text-gray-300 hover:text-red-500 transition-colors">🗑</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-7 w-[460px] shadow-2xl">
            <h2 className="font-bold text-lg mb-5">Add Assignment</h2>
            {[["Title","title","text"],["Description","desc","text"],["Deadline (e.g. Mar 10, 2026)","deadline","text"],["Estimated Hours","hours","number"]].map(([label, key, type]) => (
              <div key={key} className="mb-3.5">
                <label className="text-sm font-medium block mb-1">{label}</label>
                <input type={type} value={(form as Record<string,string>)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            ))}
            <div className="mb-3.5">
              <label className="text-sm font-medium block mb-1">Course</label>
              <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                {COURSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              {[["Priority","priority",PRIORITY_OPTIONS],["Status","status",STATUS_OPTIONS]].map(([label, key, opts]) => (
                <div key={key as string}>
                  <label className="text-sm font-medium block mb-1">{label as string}</label>
                  <select value={(form as Record<string,string>)[key as string]} onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    {(opts as readonly string[]).map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Save to DB</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}