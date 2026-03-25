/**
 * Coze API 集成模块
 * 处理与 Coze AI 助手的通信
 */

// Coze API 配置
const COZE_CONFIG = {
  API_TOKEN: process.env.NEXT_PUBLIC_COZE_API_TOKEN || 'pat_JyCKPQEYnB6lImYJpVBfFeiOiN0wDvhGi0cUvajpW3z69NDdWQiPsap7Kcw29brx',
  BOT_ID: process.env.NEXT_PUBLIC_COZE_BOT_ID || '7580584013858045967',
  API_BASE_URL: 'https://api.coze.cn',
}

/**
 * Coze 聊天消息接口
 */
export interface CozeChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  content_type: 'text'
  type?: 'question' | 'answer'
}

/**
 * 创建会话接口响应
 */
export interface CreateConversationResponse {
  code: number
  msg: string
  data: {
    id: string
  }
}

/**
 * Coze API 客户端类（单例模式）
 */
export class Coze {
  private static instance: Coze | null = null
  private static readonly API_URL = 'https://api.coze.cn/v3/chat'
  private static readonly CREATE_CONVERSATION_URL = 'https://api.coze.cn/v1/conversation/create'

  private BOT_ID: string = ''
  private API_KEY: string = ''
  private conversation: Record<string, string> = {}

  constructor(BOT_ID: string, API_KEY: string) {
    if (Coze.instance) {
      return Coze.instance
    }
    this.BOT_ID = BOT_ID
    this.API_KEY = API_KEY
    this.conversation = {}
    Coze.instance = this
  }

  /**
   * 创建新会话
   */
  async createConversation(user: string): Promise<string> {
    if (this.conversation[user]) {
      return this.conversation[user]
    }

    try {
      const response = await fetch(Coze.CREATE_CONVERSATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          bot_id: this.BOT_ID,
          user_id: user,
          stream: false,
          auto_save_history: true,
          additional_messages: []
        })
      })

      const data: CreateConversationResponse = await response.json()
      if (data.code !== 0) {
        throw new Error(data.msg || 'Failed to create conversation')
      }

      this.conversation[user] = data.data.id
      return data.data.id
    } catch (error) {
      console.error('创建会话失败:', error)
      return ''
    }
  }

  /**
   * 流式聊天模式（支持回调函数）
   */
  async streamChatWithCallback(
    conversation_id: string,
    user: string,
    query: string,
    messages: CozeChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const url = `${Coze.API_URL}?conversation_id=${conversation_id}`
    const message: CozeChatMessage = { role: 'user', content: query, content_type: 'text' }
    messages.push(message)

    const params = {
      bot_id: this.BOT_ID,
      user_id: user,
      query: query,
      additional_messages: messages,
      stream: true,
      auto_save_history: true
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify(params)
      })

      const reader = response.body!.getReader()
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const decoder = new TextDecoder()
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim()
          if (line === '') continue
          if (line.includes('[DONE]')) break

          if (line.startsWith('event:conversation.message.delta')) {
            const dataLineIndex = lines.slice(i + 1).findIndex(l => l.startsWith('data:'))
            if (dataLineIndex !== -1) {
              const dataLine = lines[i + 1 + dataLineIndex]
              const resStr = dataLine.trim().replace('data:', '')
              try {
                const respJson = JSON.parse(resStr)
                const role = respJson.data?.role || respJson.role
                const content = respJson.data?.content || respJson.content || ''
                
                if (role === 'assistant' && content && typeof content === 'string') {
                  result += content
                  if (onChunk) {
                    onChunk(content)
                  }
                }
              } catch (parseError) {
                // 跳过无效的 JSON
              }
              i += dataLineIndex
            }
          } else if (line.startsWith('data:')) {
            try {
              const resStr = line.replace('data:', '').trim()
              if (!resStr) continue
              
              const respJson = JSON.parse(resStr)
              
              if (respJson.role === 'assistant' && respJson.type === 'answer' && respJson.content) {
                const newContent = String(respJson.content)
                if (newContent.length > result.length) {
                  const incrementalContent = newContent.slice(result.length)
                  result = newContent
                  if (onChunk && incrementalContent) {
                    onChunk(incrementalContent)
                  }
                } else if (!result && newContent) {
                  result = newContent
                  if (onChunk) {
                    onChunk(newContent)
                  }
                }
              }
            } catch (e) {
              // 跳过无效的 JSON
            }
          }
        }
      }
      return result
    } catch (error) {
      console.error('流式请求失败:', error)
      return ''
    }
  }
}

/**
 * 获取 Coze 实例的辅助函数（单例模式）
 */
function getCozeInstance(): Coze {
  return new Coze(COZE_CONFIG.BOT_ID, COZE_CONFIG.API_TOKEN)
}

/**
 * 使用流式 API 向 Coze AI 助手发送消息
 */
export async function sendCozeMessageStream(
  userMessage: string,
  userId: string = 'default_user',
  onChunk: (chunk: string) => void,
  useStream: boolean = true
): Promise<string> {
  const coze = getCozeInstance()
  const conversation_id = await coze.createConversation(userId)
  const messages: CozeChatMessage[] = []

  try {
    const result = await coze.streamChatWithCallback(
      conversation_id,
      userId,
      userMessage,
      messages,
      onChunk
    )
    return result
  } catch (error) {
    console.error('Failed to send message to Coze:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('发送消息时发生未知错误')
  }
}
