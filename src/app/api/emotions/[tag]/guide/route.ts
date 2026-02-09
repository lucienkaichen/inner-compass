
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    props: { params: Promise<{ tag: string }> }
) {
    const params = await props.params;
    try {
        const { strategy } = await request.json()
        const decodedTag = decodeURIComponent(params.tag)

        const guide = await prisma.emotionGuide.upsert({
            where: { emotion: decodedTag },
            update: { strategy },
            create: {
                emotion: decodedTag,
                strategy
            }
        })

        return NextResponse.json(guide)
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
