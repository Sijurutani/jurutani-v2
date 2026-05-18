export type AIProvider = 'gemini' | 'groq' | 'openrouter'

export interface AIToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  model: string
  provider: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  tool_calls?: AIToolCall[]
}

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-1.5-flash'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  openrouter: ['google/gemma-3-27b-it:free', 'qwen/qwen3-4b:free'],
}
