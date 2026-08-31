/**
 * @typedef {Object} LlmChatMessage
 * @property {'system'|'user'|'assistant'} role
 * @property {string} content
 */

/**
 * @typedef {Object} LlmProvider
 * @property {string} name
 * @property {(args: { system?: string, messages: LlmChatMessage[], temperature?: number }) => Promise<{ text: string, usage?: object }>} chat
 * @property {(args: { system?: string, prompt: string, schema: import('zod').ZodTypeAny }) => Promise<any>} json
 * @property {(texts: string[]) => Promise<number[][]>} embed
 */

export {};
