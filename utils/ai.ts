import OpenAI from 'openai'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const openrouterApiKey = String(config.public.openrouterApiKey)
const appName = String(config.public.appName)
const appURL = String(config.public.appURL)

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openrouterApiKey,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': appURL,
    'X-Title': appName
  },
  defaultQuery: { },
  fetch: (url, init = {}) => {
    const headers = init.headers as Record<string, string>;
    delete headers['x-stainless-timeout'];
    delete headers['x-stainless-async'];
    return fetch(url, init);
  }
})

export async function sendChatMessage(messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>) {
  return await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 5000,
  })
}

export async function generateTitle(content: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI designed to generate concise, Wikipedia-style titles for a note-taking app. Your task is to analyze the input topic and produce a clear, precise title that accurately reflects the subject.

        Guidelines:
        If the input is a proper noun (e.g., a person, place, or organization), return its standard full name (e.g., "Albert Einstein" for "einstein").
        If the input describes a specific aspect of a topic (e.g., "einstein's theories"), retain the key subject while structuring the title naturally (e.g., "Einstein's Theories").
        Ensure the title is short, to the point, and does not add unnecessary words.
        Avoid generic or vague words—make the title as specific as the input requires.
        Follow capitalization rules similar to Wikipedia article titles.
        Examples:

        Input: mars → Output: Mars (Planet)
        Input: history of rome → Output: History of Rome
        Input: python programming → Output: Python (Programming Language)
        Input: quantum mechanics basics → Output: Basics of Quantum Mechanics
        Input: the effects of global warming → Output: Effects of Global Warming
        Your responses should always be precise, well-formatted, and contextually appropriate.`
      },
      {
        role: 'user',
        content: content
      }
    ],
    temperature: 0.3, // Lower temperature for more focused output
    max_tokens: 50,   // Limit tokens since we want a short title
    stream: false     // We want a single response, not a stream
  })

  return response.choices[0].message.content
}

