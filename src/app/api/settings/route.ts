
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch current persona
export async function GET() {
    try {
        const settings = await prisma.userSettings.findFirst()
        return NextResponse.json(settings || { aiPersona: '' })
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

// POST: Update persona
export async function POST(request: Request) {
    const { aiPersona } = await request.json()

    // Upsert the first record (we assume single user for now)
    // Since we don't know the ID, we use updateMany or findFirst logic
    // But findFirst + update is safer. Or just create if not exist.

    const existing = await prisma.userSettings.findFirst()

    if (existing) {
        await prisma.userSettings.update({
            where: { id: existing.id },
            data: { aiPersona }
        })
    } else {
        await prisma.userSettings.create({
            data: { aiPersona }
        })
    }

    return NextResponse.json({ success: true })
}
