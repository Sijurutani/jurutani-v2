// server/api/chat.post.ts
// AI Chatbot endpoint — JuruTani
// Menggunakan Gemini (primary) dengan fallback ke Groq

import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Kamu adalah JuruTani AI, asisten pertanian digital milik platform JuruTani Indonesia.

Kamu membantu petani, penyuluh, dan pelaku agribisnis Indonesia dengan:
- Informasi teknis budidaya tanaman (padi, jagung, sayuran, buah, dll.)
- Pengenalan dan pengendalian hama & penyakit tanaman
- Rekomendasi pupuk dan pengairan
- Info cuaca dan musim tanam
- Harga komoditas dan tips pemasaran hasil tani
- Edukasi pertanian modern dan organik

Panduan respons:
- Gunakan bahasa Indonesia yang ramah dan mudah dipahami petani
- Jawaban singkat dan actionable (max 3-4 paragraf)
- Sertakan tips praktis yang bisa langsung diterapkan
- Jika di luar topik pertanian, arahkan kembali ke topik pertanian
- Jangan jawab pertanyaan yang bersifat politik, agama, atau SARA`

export default defineEventHandler(async (event) => {
  const body = await readBody<{ message: string }>(event)

  if (!body?.message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  const config = useRuntimeConfig()

  // ── Try Gemini first ──────────────────────────────────────────────────────
  if (config.geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      })

      const result = await model.generateContent(body.message)
      const reply = result.response.text()

      if (reply) return { reply }
    } catch (err) {
      console.warn('[chat] Gemini failed, trying Groq:', err)
    }
  }

  // ── Fallback: Groq ────────────────────────────────────────────────────────
  if (config.groqApiKey) {
    try {
      const response = await $fetch<any>('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: body.message },
          ],
          max_tokens: 512,
          temperature: 0.7,
        },
      })

      const reply = response?.choices?.[0]?.message?.content
      if (reply) return { reply }
    } catch (err) {
      console.warn('[chat] Groq failed:', err)
    }
  }

  // ── Final fallback ────────────────────────────────────────────────────────
  return {
    reply: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti atau hubungi kami di WhatsApp.',
  }
})
