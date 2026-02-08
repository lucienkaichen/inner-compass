
import { Header } from '@/components/Header'
import { EntryForm } from '@/components/EntryForm'

export default function JournalPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">📝 寫下新日記</h1>
                    <p className="text-slate-600">花點時間，沈澱一下今天的思緒。</p>
                </div>
                <EntryForm />
            </main>
        </div>
    )
}
