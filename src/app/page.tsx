
import { PrismaClient } from '@prisma/client'
import { Header } from '@/components/Header'
import { EntryForm } from '@/components/EntryForm'
import { EntryList } from '@/components/EntryList'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getEntries() {
    const entries = await prisma.entry.findMany({
        orderBy: { createdAt: 'desc' },
    })

    // Serialize dates
    return entries.map(entry => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
    }))
}

export default async function Home() {
    const entries = await getEntries()

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
                <section className="text-center space-y-4 pt-8 pb-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Your Inner Compass
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        A safe space to untangle your thoughts, track your emotions, and discover patterns in your journey.
                    </p>
                </section>

                <section className="relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 blur-3xl rounded-full -z-10 transform scale-90 translate-y-10" />
                    <EntryForm />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Recent Reflections</h2>
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-500 border border-slate-200">
                            {entries.length} Entries
                        </span>
                    </div>
                    <EntryList entries={entries} />
                </section>
            </main>
        </div>
    )
}
