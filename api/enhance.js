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
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Enhance this prompt:\n\n${prompt}` }
        ]
      })
    })
    
    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data)) 
    const result = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ result })

  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || 'Internal server error' });
  }
}
