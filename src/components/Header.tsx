
import Link from 'next/link'
import { Home, Library, User, Package, Settings } from 'lucide-react'

export function Header() {
    const navItems = [
        { href: '/', label: '輸入', icon: Home },
        { href: '/emotions', label: '情緒', icon: Library },
        { href: '/about', label: '關於', icon: User },
        { href: '/toolbox', label: '工具', icon: Package },
        { href: '/settings', label: '設定', icon: Settings },
    ]

    return (
        <header className="bg-stone-50/90 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-200 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between font-serif">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-stone-800 rounded-sm flex items-center justify-center text-stone-50 font-serif font-bold text-lg group-hover:scale-95 transition-transform shadow-sm">
                        IC
                    </div>
                    <span className="font-bold text-stone-800 text-lg tracking-tight group-hover:text-stone-600 transition-colors hidden sm:block">Inner Compass</span>
                </Link>

                <nav className="flex gap-1 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center min-w-[3rem] px-2 py-1 rounded-sm text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all group"
                        >
                            <item.icon size={20} className="mb-1 group-hover:stroke-[2.5px] transition-all" />
                            <span className="opacity-70 group-hover:opacity-100">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
