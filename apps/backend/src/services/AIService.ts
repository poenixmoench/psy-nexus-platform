import axios from 'axios';

export const askAI = async (prompt: string, context?: string): Promise<string> => {
    const API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const API_KEY = process.env.AI_API_KEY || 'DEIN_API_KEY';

    const systemPrompt = `
    Du bist ein Senior Entwickler-Agent. Du arbeitest im AgentDevStudio.
    Antworte NUR in diesem Format für Aktionen:
    [[SHELL: befehl]] - Um einen Befehl auszuführen
    [[WRITE: dateipfad | inhalt]] - Um Code zu schreiben
    [[PLAN: beschreibung]] - Um deinen Denkprozess zu teilen

    Wenn du fertig bist, antworte mit [[DONE]].
    Kontext: ${context || 'Kein Kontext verfügbar'}
  `;

    const response = await axios.post(API_URL, {
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        temperature: 0.2
    }, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    return response.data.choices[0].message.content;
};
