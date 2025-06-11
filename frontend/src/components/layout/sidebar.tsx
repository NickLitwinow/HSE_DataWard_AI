'use client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileUp,
    Database,
    FileText
} from "lucide-react";
import Link from "next/link";

const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/data-sources/new", label: "Add Data Source", icon: FileUp },
]


export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 lg:block fixed h-full w-[220px] lg:w-[280px] z-20">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Database className="h-6 w-6" />
                        <span className="">DataWard AI</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navLinks.map(link => (
                             <Link
                             key={link.href}
                             href={link.href}
                             className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                { "bg-muted text-primary": pathname === link.href }
                             )}
                           >
                             <link.icon className="h-4 w-4" />
                             {link.label}
                           </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
} 