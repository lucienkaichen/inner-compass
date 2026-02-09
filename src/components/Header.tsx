
import Link from 'next/link'
import { LayoutDashboard, PenTool, BookHeart } from 'lucide-react'

export function Header() {
    const navItems = [
        { href: '/', label: '總覽', icon: LayoutDashboard },
        { href: '/journal', label: '寫日記', icon: PenTool },
        { href: '/emotions', label: '情緒圖書館', icon: BookHeart },
    ]

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-indigo-200 shadow-md">
                        IC
                    </div>
                    <span className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">Inner Compass</span>
                </Link>

                <nav className="flex gap-1 md:gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            <item.icon size={18} />
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
