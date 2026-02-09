
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch personalized strategy guide for a specific emotion
export async function GET(
    request: Request,
    props: { params: Promise<{ tag: string }> }
) {
    try {
        const params = await props.params;
        const decodedTag = decodeURIComponent(params.tag)
        const guide = await prisma.emotionGuide.findUnique({
            where: { emotion: decodedTag }
        })

        return NextResponse.json(guide || { strategy: null }) // Return null if not found
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 })
    }
}

// POST: Create or Update personalized strategy guide
export async function POST(
    request: Request,
    props: { params: Promise<{ tag: string }> }
) {
    try {
        const params = await props.params;
        const decodedTag = decodeURIComponent(params.tag)
        const { strategy } = await request.json()

        const guide = await prisma.emotionGuide.upsert({
            where: { emotion: decodedTag },
            update: { strategy },
            create: { emotion: decodedTag, strategy }
        })

        return NextResponse.json(guide)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save guide' }, { status: 500 })
    }
}
