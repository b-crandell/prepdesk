const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, question, category } = req.body;

  if (!transcript || transcript.trim().length < 5) {
    return res.status(400).json({ error: 'Transcript too short or empty' });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an expert investment banking interview coach evaluating a candidate's spoken answer.

Question (${category}): ${question}

Candidate's answer:
"${transcript}"

Score this answer on 4 dimensions from 0–100:
- Content: technical accuracy, depth, and relevance
- Structure: logical flow and organization
- Clarity: how clearly ideas are communicated
- Confidence: conviction, tone, and pacing

Also write one key insight (2–3 sentences) on the single most important thing to improve.

Respond ONLY with this exact JSON format, no other text:
{
  "scores": {
    "Content": <number>,
    "Structure": <number>,
    "Clarity": <number>,
    "Confidence": <number>
  },
  "overall": <number>,
  "insight": "<string>"
}`,
      },
    ],
  });

  try {
    const result = JSON.parse(message.content[0].text);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: 'Failed to parse AI response' });
  }
};
