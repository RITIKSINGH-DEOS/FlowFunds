// Server-side AI service — Groq API key passed from client

const getSystemInstruction = () => `You are a smart financial assistant that parses messy, informal, spoken, or shorthand financial inputs into structured data. Users may write/speak in English, Hindi, Hinglish, or any mix. They may be rough, use slang, abbreviations, typos, or incomplete sentences.

Examples of inputs you must handle:
- "chai pe 200 kharch" → Expense, Food, ₹200
- "kal 500 diye the rahul ko" → Lent to Rahul, ₹500
- "salary aayi 50k" → Income, Salary, ₹50000
- "zomato 450" → Expense, Food, ₹450
- "uber 150" → Expense, Travel, ₹150
- "borrowed 2k from amit" → Borrowed from Amit, ₹2000
- "rent 15000" → Expense, Bills, ₹15000
- "emi pay ki 8500" → Expense, EMI, ₹8500
- "recharge 299" → Expense, Bills, ₹299
- "movie 300" → Expense, Entertainment, ₹300

Rules:
1. Determine if it's a transaction or debt (lending/borrowing involving a person's name).
2. For transactions: set recordType to 'transaction', type to 'Income', 'Expense', or 'Transfer', and assign a category from: Food, Travel, Entertainment, Bills, EMI, Shopping, Salary, Other.
3. For debts: set recordType to 'debt', type to 'Lent' (you gave money) or 'Borrowed' (you received money), and extract the person's name.
4. Parse "k" as thousand (2k = 2000, 1.5k = 1500).
5. Default currency to 'INR'.
6. Always extract amount as a number and description as a clean short summary in English.
7. If the input mentions a date or relative time ("yesterday", "kal", "last Monday", "2 days ago"), set the date field to that date in YYYY-MM-DD format. Today's date is ${new Date().toISOString().split('T')[0]}. If no date is mentioned, omit the date field.
8. If the input is ambiguous, make your best guess — never refuse or ask for clarification.

The input may contain MULTIPLE transactions in one sentence (e.g., "gave Rahul 500 and spent 200 on food and got salary 50k"). Parse ALL of them.

Respond ONLY with a JSON object: { "transactions": [ ...array of objects... ] }
Each object has these fields: recordType, amount, currency, type, category, description, person, date (optional).
If there is only one transaction, still wrap it in the transactions array.`;

const insightsPrompt = `You are a personal finance advisor. Analyze the user's financial data and provide 3 short, actionable insights. Be specific with numbers. Use a friendly, concise tone.

Types of insights to give:
- Spending warnings ("Your Food spending is ₹X this month — 40% of income")
- Savings advice ("At your current rate, you save ₹X/month — consider a SIP")
- Budget tips ("You've exceeded your Entertainment budget by ₹X")
- Debt reminders ("You have ₹X in pending debts from 3 people")
- Investment suggestions ("Your portfolio is ₹X — consider diversifying into FDs")
- Positive reinforcement ("Great job! Your spending is down 20% vs last month")

Respond ONLY with a JSON array of objects: [{ "emoji": "📊", "title": "short title", "body": "1-2 sentence insight" }]`;

// --- Groq (Llama 3.3 + Whisper) ---

async function groqChat(apiKey: string, systemPrompt: string, userMessage: string, temperature = 0.1) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Groq API request failed');
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}

async function groqTranscribeAudio(apiKey: string, audioBuffer: Buffer) {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
  formData.append('file', blob, 'recording.webm');
  formData.append('model', 'whisper-large-v3-turbo');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Groq transcription failed');
  }

  const data = await response.json();
  return data.text || '';
}

// --- Public API ---
// API key is passed from the client (user provides their Groq key)

export async function parseTransactionText(text: string, apiKey: string) {
  if (!apiKey) throw new Error('API key not configured. Please add your Groq API key in Settings.');

  const prompt = `Parse the following text and extract ALL transactions: "${text}"`;
  const result = await groqChat(apiKey, getSystemInstruction(), prompt);
  return result.transactions || [result];
}

export async function parseTransactionAudio(base64Audio: string, mimeType: string, apiKey: string) {
  if (!apiKey) throw new Error('API key not configured. Please add your Groq API key in Settings.');

  const audioBuffer = Buffer.from(base64Audio, 'base64');
  const transcript = await groqTranscribeAudio(apiKey, audioBuffer);
  if (!transcript.trim()) throw new Error('Could not transcribe audio');
  const result = await groqChat(apiKey, getSystemInstruction(), `Parse the following text and extract ALL transactions: "${transcript}"`);
  return result.transactions || [result];
}

export async function generateInsights(financialSummary: string, apiKey: string): Promise<{ emoji: string; title: string; body: string }[]> {
  if (!apiKey) return [];

  try {
    const parsed = await groqChat(apiKey, insightsPrompt, financialSummary, 0.7);
    return Array.isArray(parsed) ? parsed : parsed.insights || [];
  } catch {
    return [];
  }
}
