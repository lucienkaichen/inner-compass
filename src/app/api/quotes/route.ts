
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all quotes
export async function GET() {
    try {
        const quotes = await prisma.quote.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(quotes)
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST: Add new quote
export async function POST(request: Request) {
    try {
        const { content, author } = await request.json()
        if (!content) return NextResponse.json({ error: '內容必填' }, { status: 400 })

        const quote = await prisma.quote.create({
            data: { content, source: author || '未知' }
        })
        return NextResponse.json(quote)
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// DELETE: Remove quote (Needs ID)
// For simplicity in this route file, we just handle POST/GET. 
// Delete typically needs dynamic route or query param. 
// Let's use query param for simplicity: DELETE /api/quotes?id=1
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.quote.delete({
        where: { id: parseInt(id) }
    })
    return NextResponse.json({ success: true })
}
