const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://127.0.0.1:5000'

export interface VirtualFittingRequest {
  user_image: string
  pattern_id: string
}

export interface VirtualFittingResponse {
  result_image: string
  method_used: string
}

export interface ChatbotRequest {
  query: string
  pattern_id?: string | null
}

export interface ChatbotResponse {
  response: string
  pattern_id?: string | null
  api_used?: string
}

export interface SavePhotoRequest {
  image: string
  pattern_id: string
}

export class ApiService {
  static async virtualFitting(data: VirtualFittingRequest): Promise<VirtualFittingResponse> {
    const response = await fetch(`${API_BASE_URL}/virtual_fitting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Virtual fitting failed')
    }

    return response.json()
  }

  static async chatbot(data: ChatbotRequest): Promise<ChatbotResponse> {
    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Chatbot API not available')
    }

    return response.json()
  }

  static async savePhoto(data: SavePhotoRequest): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/save_photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save photo')
    }

    return result
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/test_api`)
      return response.ok
    } catch {
      return false
    }
  }
}
