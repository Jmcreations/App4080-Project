"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/constants";

export default function Navbar() {
const pathname = usePathname();

return (
<nav className="w-64 h-screen bg-white border-r border-gray-100 p-6 flex flex-col">
<h1 className="text-xl font-bold text-indigo-600 mb-10">SWIS</h1>
<div className="flex flex-col gap-2">
{NAV_LINKS.map((link) => (
<Link
key={link.href}
href={link.href}
className={"px-4 py-2.5 rounded-lg text-sm font-medium transition-colors " +
(pathname === link.href ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50")}
>
{link.label}
</Link>
))}
</div>
</nav>
);
}