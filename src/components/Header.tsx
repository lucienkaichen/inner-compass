
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { Compass, PenTool, LayoutDashboard } from 'lucide-react'

export function Header() {
    const pathname = usePathname()

    const navItems = [
        { href: '/', label: '總覽', icon: LayoutDashboard },
        { href: '/journal', label: '寫日記', icon: PenTool },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-indigo-500/10 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-5xl mx-auto">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-950 font-tracking-tight">
                    <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                        <Compass size={20} />
                    </div>
                    <span className="hidden sm:inline-block">內在羅盤 Beta</span>
                </Link>

                <nav className="flex items-center gap-1 sm:gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-200"
                                        : "text-slate-600 hover:text-indigo-900 hover:bg-slate-50"
                                )}
                            >
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
