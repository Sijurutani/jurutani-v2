export interface AIToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: AIToolCall[]
  tool_call_id?: string
}

export type AIProvider = 'gemini' | 'groq' | 'openrouter'

export interface AIResponse {
  content: string
  model: string
  provider: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  tool_calls?: AIToolCall[]
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  messages: AIMessage[],
  model: string,
  extraHeaders: Record<string, string> = {},
): Promise<AIResponse> {
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 2048,
    temperature: 0.7,
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const message = data.choices[0]?.message

  return {
    content: message?.content ?? '',
    model: data.model ?? model,
    provider: '', // placeholder, will be set in callAI
    usage: data.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    tool_calls: message?.tool_calls as AIToolCall[] | undefined,
  }
}

export const PROVIDER_MODELS: Record<'groq' | 'gemini' | 'openrouter', string[]> = {
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  gemini: ['gemini-2.5-flash', 'gemini-1.5-flash'],
  openrouter: ['google/gemma-3-27b-it:free', 'qwen/qwen3-4b:free'],
}

export async function callAI(
  messages: AIMessage[],
  provider: 'groq' | 'gemini' | 'openrouter' = 'gemini',
): Promise<AIResponse> {
  const config = useRuntimeConfig()
  let apiKey = ''
  let baseUrl = ''
  
  if (provider === 'gemini') {
    apiKey = config.public.geminiApiKey as string
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai'
  } else if (provider === 'groq') {
    apiKey = config.public.groqApiKey as string
    baseUrl = 'https://api.groq.com/openai/v1'
  } else if (provider === 'openrouter') {
    apiKey = config.public.openrouterApiKey as string
    baseUrl = 'https://openrouter.ai/api/v1'
  }

  if (!apiKey) {
    throw new Error(`API Key untuk ${provider} belum dikonfigurasi`)
  }

  const models = PROVIDER_MODELS[provider]
  let lastError: unknown

  for (const model of models) {
    try {
      const extraHeaders = provider === 'openrouter' ? {
        'HTTP-Referer': 'https://jurutani.com',
        'X-Title': 'JuruTani',
      } : {}
      
      const res = await callOpenAICompatible(baseUrl, apiKey, messages, model, extraHeaders)
      res.provider = provider
      return res
    } catch (e: unknown) {
      console.warn(`[ai] ${provider}/${model} failed, trying next...`)
      lastError = e
    }
  }

  throw lastError ?? new Error(`Semua model gagal untuk provider: ${provider}`)
}
