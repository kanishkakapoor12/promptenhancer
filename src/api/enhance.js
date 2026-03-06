const SYSTEM_PROMPT = `You are a world-class Claude prompt engineer. Your task is to transform a basic user prompt into a masterfully crafted Claude prompt.

Apply ALL of these best practices:
1. ROLE: Assign a clear expert role/persona at the start
2. CONTEXT: Add necessary background and scope
3. XML TAGS: Structure using <instructions>, <context>, <constraints>, <output_format> tags
4. TASK: Rewrite the task with extreme clarity and specificity
5. CHAIN-OF-THOUGHT: Add "Think step by step" or explicit reasoning instructions where helpful
6. CONSTRAINTS: List what to avoid, edge cases, limitations
7. OUTPUT FORMAT: Specify exactly what the response should look like (format, length, tone, structure)
8. EXAMPLES: Add a brief positive/negative example if useful
9. CLOSING INSTRUCTION: End with a clear action directive

Return ONLY the enhanced prompt text, nothing else. No preamble, no explanation, no markdown fences.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // set in Vercel dashboard
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Enhance this prompt:\n\n${prompt.trim()}` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res
        .status(response.status)
        .json({ error: err?.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const result = data.content?.find((b) => b.type === 'text')?.text || '';

    return res.status(200).json({ result });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || 'Internal server error' });
  }
}
