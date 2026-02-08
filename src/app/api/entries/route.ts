
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const entries = await prisma.entry.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(entries)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { content, mood, tags } = body

        // Simple validation
        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const entry = await prisma.entry.create({
            data: {
                content,
                mood,
                tags: JSON.stringify(tags || []), // Store as string for now
            },
        })

        return NextResponse.json(entry)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating entry' }, { status: 500 })
    }
}
