
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch current persona
export async function GET() {
    try {
        const settings = await prisma.userSettings.findFirst()
        return NextResponse.json(settings || { aiPersona: '', geminiApiKey: null })
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST: Update persona and key
export async function POST(request: Request) {
    const { aiPersona, geminiApiKey } = await request.json()

    // Upsert the first record (we assume single user for now)
    const existing = await prisma.userSettings.findFirst()

    if (existing) {
        await prisma.userSettings.update({
            where: { id: existing.id },
            data: {
                aiPersona: aiPersona !== undefined ? aiPersona : existing.aiPersona,
                geminiApiKey: geminiApiKey !== undefined ? geminiApiKey : existing.geminiApiKey,
            }
        })
    } else {
        await prisma.userSettings.create({
            data: { aiPersona: aiPersona || '', geminiApiKey: geminiApiKey || null }
        })
    }

    return NextResponse.json({ success: true })
}
