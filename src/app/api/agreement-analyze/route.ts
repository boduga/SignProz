import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `You are a legal document analyst. Analyze the provided document text and return a structured JSON response. Always return valid JSON matching the exact schema. Focus on: key obligations, deadlines, parties involved, risky clauses (indemnification, liability caps, auto-renewal, termination traps), and recommended actions for a signer.`

export async function POST(request: Request) {
  const { content } = await request.json()

  if (!content || typeof content !== 'string') {
    return Response.json({ error: 'content is required' }, { status: 400 })
  }

  const truncated = content.slice(0, 10000)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: truncated,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const parsed = JSON.parse(responseText)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({
      summary: responseText.slice(0, 300),
      keyTerms: [],
      riskFlags: [],
      recommendedActions: [],
    })
  }
}
