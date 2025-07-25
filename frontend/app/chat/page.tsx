"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react"

// Complete batik patterns data for chatbot knowledge
const batikPatterns = [
  {
    id: "sekar_kemuning",
    name: "Sekar Kemuning",
    description: "Motif bunga kemuning yang melambangkan keseimbangan antara cipta, rasa, dan karsa",
  },
  {
    id: "ceplok_liring",
    name: "Ceplok Liring",
    description: "Penempatan ragam hias secara tidak beraturan dalam satu bidang",
  },
  { id: "sekar_duren", name: "Sekar Duren", description: "Motif bunga durian yang melambangkan sikap kritis" },
  { id: "sekar_gayam", name: "Sekar Gayam", description: "Motif dari pohon gayam yang memberikan keteduhan" },
  { id: "sekar_pacar", name: "Sekar Pacar", description: "Bunga pacar yang digunakan dalam upacara Hindu" },
  { id: "arumdalu", name: "Arumdalu", description: "Bunga yang mekar di malam hari dan menyebarkan keharuman" },
  // ... (include all 60 patterns as needed)
]

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        text: "Selamat datang di BatikGram Chat Assistant! 🎨\n\nSaya adalah asisten virtual yang siap membantu Anda mempelajari tentang batik Indonesia. Saya dapat memberikan informasi tentang:\n\n• 60+ motif batik tradisional\n• Sejarah dan makna filosofis batik\n• Asal daerah setiap motif\n• Teknik pembuatan batik\n• Budaya dan tradisi batik Nusantara\n\nSaya memiliki keterbatasan dalam menjawab pertanyaan di luar topik batik. Mohon maaf jika saya tidak dapat memberikan jawaban yang memuaskan untuk semua pertanyaan.\n\nSilakan tanyakan apa saja tentang batik!",
        isUser: false,
        timestamp: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    // Check if asking about specific pattern
    const pattern = batikPatterns.find(
      (p) => lowerMessage.includes(p.name.toLowerCase()) || lowerMessage.includes(p.id.replace(/_/g, " ")),
    )

    if (pattern) {
      return `🌸 **${pattern.name}**\n\n${pattern.description}\n\nApakah Anda ingin mengetahui lebih lanjut tentang motif batik lainnya?`
    }

    // Greeting responses
    if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hello")) {
      return "Halo! Selamat datang di BatikGram! 👋\n\nSaya siap membantu Anda mempelajari keindahan batik Indonesia. Ada yang ingin Anda ketahui tentang batik?"
    }

    // General batik questions
    if (lowerMessage.includes("batik") && lowerMessage.includes("apa")) {
      return "🎨 **Tentang Batik**\n\nBatik adalah seni tekstil tradisional Indonesia yang menggunakan teknik pewarnaan dengan lilin (wax-resist dyeing). Batik telah diakui UNESCO sebagai Warisan Kemanusiaan untuk Budaya Lisan dan Nonbendawi pada tahun 2009.\n\nBatik memiliki makna filosofis yang mendalam dan setiap motifnya menceritakan nilai-nilai kehidupan masyarakat Indonesia."
    }

    if (lowerMessage.includes("motif") || lowerMessage.includes("pattern")) {
      return "🌺 **Motif Batik Tradisional**\n\nBatik Indonesia memiliki ratusan motif tradisional, beberapa yang terkenal:\n\n• **Kawung** - Melambangkan kesucian dan kebijaksanaan\n• **Parang** - Simbol kekuatan dan keteguhan\n• **Ceplok** - Representasi keseimbangan alam\n• **Sekar Jagad** - Keindahan dunia\n• **Truntum** - Cinta yang tumbuh kembali\n\nSetiap daerah di Indonesia memiliki motif khasnya sendiri!"
    }

    if (lowerMessage.includes("sejarah") || lowerMessage.includes("history")) {
      return "📜 **Sejarah Batik**\n\nBatik telah ada di Indonesia sejak abad ke-6, dimulai dari Jawa. Perkembangannya:\n\n• **Abad 6-7**: Teknik batik mulai dikenal\n• **Abad 13**: Berkembang di keraton Jawa\n• **Abad 17-19**: Menyebar ke seluruh Nusantara\n• **1840**: Batik cap ditemukan\n• **2009**: Diakui UNESCO\n\nBatik bukan hanya seni, tapi juga filosofi hidup bangsa Indonesia."
    }

    if (lowerMessage.includes("cara") && lowerMessage.includes("buat")) {
      return "🎨 **Cara Membuat Batik**\n\nProses pembuatan batik tradisional:\n\n1. **Nyorek** - Menggambar pola di kain\n2. **Nglowong** - Menutup pola dengan lilin\n3. **Medel** - Pewarnaan pertama\n4. **Ngerok** - Menghilangkan lilin\n5. **Mbironi** - Menutup bagian yang sudah diwarnai\n6. **Nyoga** - Pewarnaan kedua\n7. **Nglorod** - Menghilangkan semua lilin\n\nProses ini bisa memakan waktu berhari-hari hingga berbulan-bulan!"
    }

    if (lowerMessage.includes("daerah") || lowerMessage.includes("asal")) {
      return "🗺️ **Batik dari Berbagai Daerah**\n\n• **Yogyakarta**: Batik Klasik (Kawung, Parang)\n• **Solo**: Batik Keraton (Sidomukti, Sidoluruh)\n• **Pekalongan**: Batik Pesisir (warna cerah)\n• **Cirebon**: Batik Trusmi (Mega Mendung)\n• **Madura**: Batik dengan warna kontras\n• **Bali**: Batik dengan motif Hindu\n• **Betawi**: Batik Ondel-ondel\n\nSetiap daerah memiliki ciri khas dan filosofi tersendiri!"
    }

    if (lowerMessage.includes("warna") || lowerMessage.includes("color")) {
      return "🌈 **Makna Warna dalam Batik**\n\n• **Biru**: Ketenangan dan kedamaian\n• **Coklat**: Kesederhanaan dan keteguhan\n• **Kuning**: Kemewahan dan keagungan\n• **Merah**: Keberanian dan semangat\n• **Hitam**: Kematangan dan kebijaksanaan\n• **Putih**: Kesucian dan kemurnian\n\nWarna-warna ini dipilih berdasarkan makna filosofis yang mendalam dalam budaya Jawa."
    }

    // Default responses
    const defaultResponses = [
      "Maaf, saya belum memahami pertanyaan Anda. Coba tanyakan tentang:\n\n• Motif batik tertentu (contoh: 'Sekar Kemuning')\n• Sejarah batik\n• Cara membuat batik\n• Makna warna batik\n• Batik dari daerah tertentu",
      "Saya siap membantu Anda belajar tentang batik! Silakan tanyakan tentang motif batik, sejarah, atau budaya batik Indonesia.",
      "Apakah Anda ingin mengetahui tentang motif batik tertentu? Atau mungkin sejarah dan filosofi di balik batik Indonesia?",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: generateResponse(inputMessage),
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Batik Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 bg-amber-600 rounded-full"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-red-600 rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-48 h-48 bg-orange-600 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-36 h-36 bg-yellow-600 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent mb-2">
            Chat dengan Asisten Batik
          </h1>
          <p className="text-amber-600">Pelajari budaya batik Indonesia dengan bantuan AI assistant</p>
        </div>

        {/* Chat Container */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-amber-200">
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <MessageCircle className="w-6 h-6" />
              <span>BatikGram Assistant</span>
              <div className="flex items-center space-x-1 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.isUser ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isUser
                        ? "bg-gradient-to-r from-amber-600 to-red-600"
                        : "bg-gradient-to-r from-blue-600 to-purple-600"
                    }`}
                  >
                    {message.isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? "bg-gradient-to-r from-amber-600 to-red-600 text-white"
                        : "bg-white border border-amber-200 text-amber-800"
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isUser ? "text-amber-100" : "text-amber-500"} opacity-70`}>
                      {message.timestamp.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-amber-200 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-amber-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tanyakan tentang batik Indonesia..."
                  className="flex-1 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isTyping}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Questions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {["Apa itu batik?", "Motif batik populer", "Sejarah batik", "Cara membuat batik"].map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(question)}
                    className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    disabled={isTyping}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto mt-4 text-sm text-amber-700">
          <p>
            <strong>Disclaimer:</strong> Asisten BatikGram adalah program AI yang dirancang untuk memberikan informasi
            tentang batik Indonesia. Kami berusaha memberikan jawaban yang akurat dan relevan, tetapi kami tidak
            bertanggung jawab atas kesalahan atau kekurangan informasi. Asisten ini memiliki keterbatasan pengetahuan
            dan mungkin tidak dapat menjawab semua pertanyaan.
          </p>
        </div>

        {/* Features Info */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-800 mb-1">60+ Motif Batik</h3>
              <p className="text-sm text-amber-700">Informasi lengkap tentang motif batik tradisional</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Bot className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-800 mb-1">AI Assistant</h3>
              <p className="text-sm text-amber-700">Asisten cerdas yang memahami budaya batik</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-amber-800 mb-1">Chat Real-time</h3>
              <p className="text-sm text-amber-700">Tanya jawab interaktif tentang batik</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
