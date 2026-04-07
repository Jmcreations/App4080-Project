import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
return (
<div className="flex">
<Navbar />
<main className="flex-1 min-h-screen bg-gray-50 p-8">
{children}
</main>
</div>
);
}