"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Download, Sparkles, MessageCircle } from "lucide-react"

interface Pattern {
  id: string
  name: string
  filename: string
  image_url?: string
  description?: string
}

interface ChatMessage {
  text: string
  isUser: boolean
}

export default function PatternsPage() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "loading" }>()
  const [batikPatterns, setBatikPatterns] = useState<Pattern[]>([])
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(true)

  const router = useRouter()

  // API Configuration
  const API_URL = "http://127.0.0.1:5000"

  // Fetch patterns from backend API
  const fetchPatterns = async () => {
    try {
      setIsLoadingPatterns(true)
      const response = await fetch(`${API_URL}/get_batik_patterns`)
      if (response.ok) {
        const data = await response.json()
        const patternsWithImageUrls = data.patterns.map((pattern: Pattern) => ({
          ...pattern,
          image_url: `${API_URL}/patterns/${pattern.id}/${pattern.filename}`,
          description: `Motif ${pattern.name} - salah satu motif tradisional Batik Nitik yang kaya akan makna filosofis`
        }))
        setBatikPatterns(patternsWithImageUrls)
      } else {
        console.error('Failed to fetch patterns:', response.status)
        showStatus("Gagal memuat daftar motif batik", "error")
      }
    } catch (error) {
      console.error('Error fetching patterns:', error)
      showStatus("Gagal memuat daftar motif batik", "error")
    } finally {
      setIsLoadingPatterns(false)
    }
  }

  useEffect(() => {
    // Get captured image from sessionStorage
    const storedImage = sessionStorage.getItem("capturedImage")
    if (storedImage) {
      setCapturedImage(storedImage)
    } else {
      // If no image, redirect back to camera
      router.push("/camera")
    }

    // Fetch patterns from backend
    fetchPatterns()

    // Initialize chatbot with welcome message
    setChatMessages([
      {
        text: "Selamat datang! Saya siap membantu Anda belajar tentang motif Batik Nitik. Silakan tanyakan tentang motif tertentu atau pilih motif dari galeri.",
        isUser: false,
      },
    ])
  }, [router])

  const filteredPatterns = batikPatterns.filter(
    (pattern) =>
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectPattern = (patternId: string) => {
    setSelectedPattern(patternId)
    const pattern = batikPatterns.find((p: Pattern) => p.id === patternId)
    if (pattern) {
      showStatus(`Selected: ${pattern.name}`, "success")
      // Add chatbot message about selected pattern
      setChatMessages((prev) => [
        ...prev,
        { text: `Anda memilih motif ${pattern.name}: ${pattern.description}`, isUser: false },
      ])
    }
  }

  const showStatus = (message: string, type: "success" | "error" | "loading") => {
    setStatusMessage({ text: message, type })
    if (type !== "loading") {
      setTimeout(() => setStatusMessage(undefined), 3000)
    }
  }

  const applyBatik = async () => {
    if (!selectedPattern || !capturedImage) {
      showStatus("Silakan pilih motif dan pastikan foto telah diambil", "error")
      return
    }

    setIsProcessing(true)
    showStatus("Menerapkan motif batik menggunakan IDM-VTON AI (wajib)...", "loading")

    try {
      let imageData = capturedImage
      if (imageData.startsWith("data:image/")) {
        imageData = imageData.split(",")[1]
      }

      if (!imageData || imageData.length < 100) {
        throw new Error("Invalid image data")
      }

      const response = await fetch(`${API_URL}/virtual_fitting`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          user_image: imageData,
          pattern_id: selectedPattern,
          force_idm_vton: true  // Force IDM-VTON usage
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResultImage(data.result_image)
        
        showStatus(`✅ Motif batik berhasil diterapkan dengan IDM-VTON!`, "success")
        console.log("IDM-VTON success:", data.method_used)
      } else {
        const errorData = await response.json()
        
        if (response.status === 500 && errorData.no_fallback) {
          throw new Error(`IDM-VTON REQUIRED: ${errorData.solution || errorData.error}`)
        } else if (response.status === 401) {
          throw new Error("Token Hugging Face tidak valid. Mohon periksa konfigurasi HUGGING_FACE_TOKEN.")
        } else if (response.status === 503) {
          throw new Error("IDM-VTON API sementara tidak tersedia. Silakan coba lagi dalam beberapa menit.")
        } else {
          throw new Error(errorData.error || "IDM-VTON processing failed")
        }
      }
    } catch (err: any) {
      console.error("IDM-VTON error:", err)
      showStatus(`❌ ${err.message}`, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const saveImage = async () => {
    if (!resultImage) {
      showStatus("No result to save", "error")
      return
    }

    try {
      const response = await fetch(`${API_URL}/save_photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: resultImage.split(",")[1],
          pattern_id: selectedPattern,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showStatus("Photo saved successfully", "success")
      } else {
        showStatus("Error saving photo: " + data.error, "error")
      }
    } catch (err: any) {
      showStatus("Error saving photo: " + err.message, "error")
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatMessages((prev) => [...prev, { text: userMessage, isUser: true }])
    setChatInput("")
    setIsChatLoading(true)

    try {
      // Call backend chatbot API
      const response = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          pattern_id: selectedPattern,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages((prev) => [...prev, { text: data.response, isUser: false }])
      } else {
        throw new Error("API not available")
      }
    } catch (err) {
      console.error("Chatbot error:", err)
      // Fallback to local response generation
      const response = generateFallbackResponse(userMessage)
      setChatMessages((prev) => [...prev, { text: response, isUser: false }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const generateFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    // Check if asking about specific pattern
    const pattern = batikPatterns.find(
      (p: Pattern) =>
        lowerMessage.includes(p.name.toLowerCase()) ||
        lowerMessage.includes(p.id.toLowerCase()) ||
        lowerMessage.includes(p.name.toLowerCase().replace(" ", "")),
    )

    if (pattern) {
      return `${pattern.name}: ${
        pattern.description || "Motif batik tradisional dengan makna filosofis mendalam."
      }`
    }

    // Check if query is batik-related
    const batikKeywords = [
      "batik",
      "nitik",
      "motif",
      "sekar",
      "pattern",
      "tradisional",
      "yogyakarta",
      "jawa",
      "filosofi",
      "makna",
    ]
    const isBatikRelated = batikKeywords.some((keyword) => lowerMessage.includes(keyword))

    if (!isBatikRelated && !lowerMessage.includes("halo") && !lowerMessage.includes("hai")) {
      return "Maaf, saya adalah asisten khusus untuk Batik Nitik dari Yogyakarta. Saya hanya dapat membantu menjawab pertanyaan tentang motif-motif Batik Nitik dan aspek terkaitnya."
    }

    // Enhanced responses based on keywords
    if (lowerMessage.includes("makna") || lowerMessage.includes("filosofi")) {
      if (selectedPattern) {
        const selectedMotif = batikPatterns.find((p: Pattern) => p.id === selectedPattern)
        if (selectedMotif) {
          return `Makna filosofis motif ${selectedMotif.name}: ${selectedMotif.description}`
        }
      }
      return "Setiap motif Batik Nitik memiliki makna filosofis yang mendalam. Pilih motif tertentu dari galeri untuk mengetahui maknanya lebih detail."
    }

    if (lowerMessage.includes("sejarah") || lowerMessage.includes("asal usul")) {
      return "Batik Nitik adalah batik klasik dari Yogyakarta dengan teknik yang sangat teliti. Nama 'nitik' berasal dari kata 'titik' yang menggambarkan motif-motif kecil dan detail."
    }

    if (lowerMessage.includes("berapa") || lowerMessage.includes("jumlah")) {
      return `Batik Nitik memiliki berbagai motif tradisional. Dalam galeri ini tersedia ${batikPatterns.length} motif dengan informasi lengkap.`
    }

    if (lowerMessage.includes("motif") || lowerMessage.includes("pattern")) {
      return "Batik Nitik memiliki berbagai motif tradisional. Beberapa yang populer adalah Sekar Kemuning, Kawung Nitik, Cakar Ayam, dan lainnya. Setiap motif memiliki makna filosofis yang mendalam."
    }

    if (lowerMessage.includes("batik")) {
      return "Batik Nitik adalah batik klasik dari Yogyakarta dengan berbagai motif tradisional. Setiap motif memiliki makna filosofis yang mencerminkan kebijaksanaan masyarakat Jawa."
    }

    if (lowerMessage.includes("halo") || lowerMessage.includes("hai")) {
      return `Halo! Saya adalah asisten khusus Batik Nitik. Saya dapat membantu Anda mempelajari ${batikPatterns.length} motif Batik Nitik yang tersedia.`
    }

    return `Silakan tanyakan tentang motif-motif Batik Nitik yang tersedia. Anda dapat bertanya tentang makna filosofis, deskripsi, atau karakteristik visual dari ${batikPatterns.length} motif yang terdokumentasi.`
  }

  const goBack = () => {
    router.push("/camera")
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

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={goBack} variant="ghost" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent">
            Pilih Motif Batik
          </h1>
          <Button
            onClick={() => setShowChatbot(!showChatbot)}
            variant="ghost"
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Tanya Batik
          </Button>
        </div>
      </div>

      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo Preview */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="text-amber-800">Foto Anda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {capturedImage && (
                  <div className="relative">
                    <img src={resultImage || capturedImage} alt="Your photo" className="w-full rounded-lg shadow-md" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p>Menerapkan motif batik...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedPattern && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800">Motif Terpilih:</p>
                    <p className="text-amber-700">{batikPatterns.find((p: Pattern) => p.id === selectedPattern)?.name}</p>
                  </div>
                )}

                {/* Status Message */}
                {statusMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      statusMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : statusMessage.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {statusMessage.type === "loading" && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      )}
                      {statusMessage.text}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={applyBatik}
                    disabled={!selectedPattern || isProcessing}
                    className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Terapkan Motif
                      </>
                    )}
                  </Button>

                  {resultImage && (
                    <Button
                      onClick={saveImage}
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Simpan Foto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pattern Selection */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-800">
                  {isLoadingPatterns ? "Memuat Motif Batik..." : `${batikPatterns.length} Motif Batik Nitik Tradisional`}
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cari motif batik..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPatterns ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    <span className="ml-2 text-amber-700">Memuat motif batik...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {filteredPatterns.map((pattern: Pattern, index: number) => {
                      const colors = ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F4A460", "#DAA520"]
                      const bgColor = colors[index % colors.length]
                      const isSelected = selectedPattern === pattern.id

                      return (
                        <div
                          key={pattern.id}
                          onClick={() => selectPattern(pattern.id)}
                          className={`cursor-pointer border-2 rounded-lg p-2 transition-all hover:shadow-md ${
                            isSelected
                              ? "border-amber-500 bg-amber-50 shadow-md"
                              : "border-amber-200 hover:border-amber-400"
                          }`}
                          title={pattern.name}
                        >
                          {pattern.image_url ? (
                            <img
                              src={pattern.image_url}
                              alt={pattern.name}
                              className="w-full h-20 object-cover rounded-md mb-2"
                              onError={(e) => {
                                // Fallback to gradient if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-20 rounded-md flex items-center justify-center text-white text-xs text-center p-2 mb-2 ${pattern.image_url ? 'hidden' : ''}`}
                            style={{
                              background: `linear-gradient(45deg, ${bgColor}, ${colors[(index + 1) % colors.length]})`,
                            }}
                          >
                            {pattern.name}
                          </div>
                          <p className="text-xs text-amber-800 font-medium text-center">{pattern.name}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Chatbot Modal */}
        {showChatbot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md h-96 bg-white shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-800 text-lg">Tanya Tentang Batik</CardTitle>
                  <Button onClick={() => setShowChatbot(false)} variant="ghost" size="sm" className="text-amber-600">
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-full pb-4">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-amber-50 rounded-lg p-3">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-sm ${
                        msg.isUser
                          ? "bg-amber-600 text-white ml-8"
                          : "bg-white text-amber-800 mr-8 border border-amber-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="bg-white text-amber-800 mr-8 border border-amber-200 p-2 rounded-lg text-sm">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                        Mengetik...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Tanya tentang batik..."
                    className="border-amber-200 focus:border-amber-500"
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={sendChatMessage}
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={isChatLoading}
                  >
                    Kirim
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
