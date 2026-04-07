export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
return (
<div className={"bg-white p-6 rounded-xl border border-gray-100 shadow-sm " + className}>
{children}
</div>
);
}