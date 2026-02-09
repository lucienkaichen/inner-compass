
'use client'

import { EntryCard } from './EntryCard'

// We use 'any' here primarily because the Entry type is complex and defined 
// locally in EntryCard. In a larger app, we'd have a shared types file.
export function EntryList({ entries }: { entries: any[] }) {
    if (!entries || entries.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-sm">
                <p className="text-stone-400 font-serif italic text-lg">
                    這裡還是一片空白。
                </p>
                <div className="mt-4 text-xs text-stone-300 font-sans uppercase tracking-widest">
                    JOURNAL IS EMPTY
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            {entries.map((entry) => (
                <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={() => window.location.reload()}
                />
            ))}
        </div>
    )
}
