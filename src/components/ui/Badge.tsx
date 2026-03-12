import { BADGE_CLASSES } from "@/lib/utils";

export default function Badge({ type, children }: { type: string; children: React.ReactNode }) {
const classes = BADGE_CLASSES[type.toLowerCase()] || "bg-gray-100 text-gray-600";
return (
<span className={"px-2 py-0.5 rounded-full text-xs font-medium " + classes}>
{children}
</span>
);
}