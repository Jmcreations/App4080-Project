export default function DbIndicator({ status }: { status: "live" | "loading" | "saved" }) {
const colors = {
live: "bg-green-500",
loading: "bg-yellow-500 animate-pulse",
saved: "bg-blue-500",
};

return (
<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
<div className={"w-2 h-2 rounded-full " + colors[status]} />
<span className="text-[10px] font-medium text-gray-400 uppercase">{status}</span>
</div>
);
}