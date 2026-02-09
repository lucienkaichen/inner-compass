
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH: Update an entry or its analysis
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = parseInt(params.id)
        const body = await request.json()
        const { content, mood, tags, analysis } = body

        // 1. Update Entry Basics
        const updateData: any = {}
        if (content !== undefined) updateData.content = content
        if (mood !== undefined) updateData.mood = mood
        if (tags !== undefined) updateData.tags = JSON.stringify(tags)

        // Perform entry update
        const updatedEntry = await prisma.entry.update({
            where: { id },
            data: updateData,
            include: { analysis: true }
        })

        // 2. Update AI Analysis (if provided)
        // This allows user to "correct" the AI
        if (analysis) {
            const { summary, emotionTags, connections, customInsights } = analysis

            await prisma.analysis.update({
                where: { entryId: id },
                data: {
                    summary,
                    emotionTags: typeof emotionTags === 'object' ? JSON.stringify(emotionTags) : emotionTags,
                    connections,
                    customInsights: typeof customInsights === 'object' ? JSON.stringify(customInsights) : customInsights,
                }
            })
        }

        // Return the fresh data
        const finalEntry = await prisma.entry.findUnique({
            where: { id },
            include: { analysis: true }
        })

        return NextResponse.json(finalEntry)

    } catch (error) {
        console.error("Update failed:", error)
        return NextResponse.json({ error: 'Error updating entry' }, { status: 500 })
    }
}

// DELETE: Delete an entry
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = parseInt(params.id)

        // Privacy: Delete associated analysis and strategy first (if cascading not set)
        // Prisma usually handles cascade delete if configured, but let's be safe
        // Actually, our schema might not have cascade delete, so manual cleanup is safer or rely on relation

        await prisma.entry.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting entry' }, { status: 500 })
    }
}
