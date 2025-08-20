export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, prompt } = req.body;
  if (!prompt || !provider) {
    return res.status(400).json({ error: '缺少 provider 或 prompt' });
  }

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await response.json();
      return res.status(200).json({ result: data.choices[0].message.content });
    }

    if (provider === 'gemini') {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "生成失败";
      return res.status(200).json({ result: text });
    }

    return res.status(400).json({ error: '未知 provider' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '调用 AI API 出错' });
  }
}

