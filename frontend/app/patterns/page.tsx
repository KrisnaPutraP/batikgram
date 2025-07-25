"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Download, Sparkles, MessageCircle } from "lucide-react"

interface Pattern {
  id: number
  name: string
  image_url: string
}

// Complete batik patterns data (60 motifs)
const batikPatterns: Pattern[] = [
  {
    id: 1,
    name: "Sekar Kemuning",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_kemuning.jpg",
  },
  {
    id: 2,
    name: "Ceplok Liring",
    image_url: "http://127.0.0.1:5000/static/patterns/ceplok_liring.jpg",
  },
  {
    id: 3,
    name: "Sekar Duren",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_duren.jpg",
  },
  {
    id: 4,
    name: "Sekar Gayam",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_gayam.jpg",
  },
  {
    id: 5,
    name: "Sekar Pacar",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_pacar.jpg",
  },
  {
    id: 6,
    name: "Arumdalu",
    image_url: "http://127.0.0.1:5000/static/patterns/arumdalu.jpg",
  },
  {
    id: 7,
    name: "Sekar Srigading",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_srigading.jpg",
  },
  {
    id: 8,
    name: "Kemukus",
    image_url: "http://127.0.0.1:5000/static/patterns/kemukus.jpg",
  },
  {
    id: 9,
    name: "Sekar Gudhe",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_gudhe.jpg",
  },
  {
    id: 10,
    name: "Sekar Ketongkeng",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_ketongkeng.jpg",
  },
  {
    id: 11,
    name: "Brendi",
    image_url: "http://127.0.0.1:5000/static/patterns/brendi.jpg",
  },
  {
    id: 12,
    name: "Cakar Ayam",
    image_url: "http://127.0.0.1:5000/static/patterns/cakar_ayam.jpg",
  },
  {
    id: 13,
    name: "Sekar Menur",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_menur.jpg",
  },
  {
    id: 14,
    name: "Sekar Tebu",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_tebu.jpg",
  },
  {
    id: 15,
    name: "Sekar Manggis",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_manggis.jpg",
  },
  {
    id: 16,
    name: "Sekar Randu",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_randu.jpg",
  },
  {
    id: 17,
    name: "Worawari Rumpuk",
    image_url: "http://127.0.0.1:5000/static/patterns/worawari_rumpuk.jpg",
  },
  {
    id: 18,
    name: "Sekar Duku",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_duku.jpg",
  },
  {
    id: 19,
    name: "Sekar Jagung",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_jagung.jpg",
  },
  {
    id: 20,
    name: "Jayakirana",
    image_url: "http://127.0.0.1:5000/static/patterns/jayakirana.jpg",
  },
  {
    id: 21,
    name: "Mawur",
    image_url: "http://127.0.0.1:5000/static/patterns/mawur.jpg",
  },
  {
    id: 22,
    name: "Sekar Tanjung",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_tanjung.jpg",
  },
  {
    id: 23,
    name: "Sekar Keben",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_keben.jpg",
  },
  {
    id: 24,
    name: "Sekar Srengenge",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_srengenge.jpg",
  },
  {
    id: 25,
    name: "Sekar Soka",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_soka.jpg",
  },
  {
    id: 26,
    name: "Sekar Nangka",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_nangka.jpg",
  },
  {
    id: 27,
    name: "Kawung Nitik",
    image_url: "http://127.0.0.1:5000/static/patterns/kawung_nitik.jpg",
  },
  {
    id: 28,
    name: "Sekar Kentang",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_kentang.jpg",
  },
  {
    id: 29,
    name: "Sekar Pudak",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_pudak.jpg",
  },
  {
    id: 30,
    name: "Sekar Dlima",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_dlima.jpg",
  },
  {
    id: 31,
    name: "Karawitan",
    image_url: "http://127.0.0.1:5000/static/patterns/karawitan.jpg",
  },
  {
    id: 32,
    name: "Cinde Wilis",
    image_url: "http://127.0.0.1:5000/static/patterns/cinde_wilis.jpg",
  },
  {
    id: 33,
    name: "Sekar Mlati",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_mlati.jpg",
  },
  {
    id: 34,
    name: "Kuncup Kanthil",
    image_url: "http://127.0.0.1:5000/static/patterns/kuncup_kanthil.jpg",
  },
  {
    id: 35,
    name: "Sekar Dangan",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_dangan.jpg",
  },
  {
    id: 36,
    name: "Sekar Sawo",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_sawo.jpg",
  },
  {
    id: 37,
    name: "Manggar",
    image_url: "http://127.0.0.1:5000/static/patterns/manggar.jpg",
  },
  {
    id: 38,
    name: "Sekar Cengkeh",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_cengkeh.jpg",
  },
  {
    id: 39,
    name: "Sritaman",
    image_url: "http://127.0.0.1:5000/static/patterns/sritaman.jpg",
  },
  {
    id: 40,
    name: "Sekar Mundu",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_mundu.jpg",
  },
  {
    id: 41,
    name: "Sekar Andong",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_andong.jpg",
  },
  {
    id: 42,
    name: "Gedhangan",
    image_url: "http://127.0.0.1:5000/static/patterns/gedhangan.jpg",
  },
  {
    id: 43,
    name: "Sekar Pala",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_pala.jpg",
  },
  {
    id: 44,
    name: "Klampok Arum",
    image_url: "http://127.0.0.1:5000/static/patterns/klampok_arum.jpg",
  },
  {
    id: 45,
    name: "Sekar Jali",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_jali.jpg",
  },
  {
    id: 46,
    name: "Sekar Lintang",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_lintang.jpg",
  },
  {
    id: 47,
    name: "Sekar Kenanga",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_kenanga.jpg",
  },
  {
    id: 48,
    name: "Sekar Jeruk",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_jeruk.jpg",
  },
  {
    id: 49,
    name: "Sekar Mindi",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_mindi.jpg",
  },
  {
    id: 50,
    name: "Tanjung Gunung",
    image_url: "http://127.0.0.1:5000/static/patterns/tanjung_gunung.jpg",
  },
  {
    id: 51,
    name: "Sekar Kenikir",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_kenikir.jpg",
  },
  {
    id: 52,
    name: "Sekar Blimbing",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_blimbing.jpg",
  },
  {
    id: 53,
    name: "Sekar Pijetan",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_pijetan.jpg",
  },
  {
    id: 54,
    name: "Sarimulat",
    image_url: "http://127.0.0.1:5000/static/patterns/sarimulat.jpg",
  },
  {
    id: 55,
    name: "Sekar Mrica",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_mrica.jpg",
  },
  {
    id: 56,
    name: "Sekar Kepel",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_kepel.jpg",
  },
  {
    id: 57,
    name: "Truntum Kurung",
    image_url: "http://127.0.0.1:5000/static/patterns/truntum_kurung.jpg",
  },
  {
    id: 58,
    name: "Jayakusuma",
    image_url: "http://127.0.0.1:5000/static/patterns/jayakusuma.jpg",
  },
  {
    id: 59,
    name: "Rengganis",
    image_url: "http://127.0.0.1:5000/static/patterns/rengganis.jpg",
  },
  {
    id: 60,
    name: "Sekar Gambir",
    image_url: "http://127.0.0.1:5000/static/patterns/sekar_gambir.jpg",
  },
]

export default function PatternsPage() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [chatInput, setChatInput] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Get captured image from sessionStorage
    const storedImage = sessionStorage.getItem("capturedImage")
    if (storedImage) {
      setCapturedImage(storedImage)
    } else {
      // If no image, redirect back to camera
      router.push("/camera")
    }

    // Initialize chatbot
    setChatMessages([
      {
        text: "Selamat datang! Saya siap membantu Anda belajar tentang 60 motif Batik Nitik. Silakan tanyakan tentang motif tertentu atau pilih motif dari galeri.",
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
    const pattern = batikPatterns.find((p) => p.id.toString() === patternId)
    if (pattern) {
      // Add chatbot message about selected pattern
      setChatMessages((prev) => [
        ...prev,
        { text: `Anda memilih motif ${pattern.name}: ${pattern.description}`, isUser: false },
      ])
    }
  }

  const applyBatik = async () => {
    if (!selectedPattern || !capturedImage) {
      alert("Silakan pilih motif dan pastikan foto telah diambil")
      return
    }

    setIsProcessing(true)

    // Simulate AI processing (replace with actual API call)
    setTimeout(() => {
      // For demo, we'll just overlay the captured image with a pattern effect
      setResultImage(capturedImage) // In real app, this would be the AI-processed result
      setIsProcessing(false)
    }, 3000)
  }

  const saveImage = () => {
    if (!resultImage) return

    // Create download link
    const link = document.createElement("a")
    link.href = resultImage
    link.download = `batik-${selectedPattern}-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert("Foto berhasil disimpan!")
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatMessages((prev) => [...prev, { text: userMessage, isUser: true }])
    setChatInput("")

    // Generate response
    setTimeout(() => {
      const response = generateChatResponse(userMessage)
      setChatMessages((prev) => [...prev, { text: response, isUser: false }])
    }, 1000)
  }

  const generateChatResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Check if asking about specific pattern
    const pattern = batikPatterns.find(
      (p) => lowerMessage.includes(p.name.toLowerCase()) || lowerMessage.includes(p.id.toString()),
    )

    if (pattern) {
      return `${pattern.name}: ${pattern.description}`
    }

    // General responses
    if (lowerMessage.includes("motif") || lowerMessage.includes("pattern")) {
      return "Batik Nitik memiliki 60 motif tradisional. Beberapa yang populer adalah Sekar Kemuning, Ceplok Liring, Cakar Ayam, dan Kawung Nitik. Setiap motif memiliki makna filosofis yang mendalam."
    }

    if (lowerMessage.includes("batik")) {
      return "Batik Nitik adalah batik klasik dari Yogyakarta dengan 60 motif tradisional. Setiap motif memiliki makna filosofis yang mencerminkan kebijaksanaan masyarakat Jawa."
    }

    return "Maaf, saya membantu menjelaskan tentang motif-motif Batik Nitik. Silakan tanyakan tentang motif tertentu atau ketik nama motif yang ingin Anda ketahui."
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
                    <p className="text-amber-700">{batikPatterns.find((p) => p.id.toString() === selectedPattern)?.name}</p>
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
                <CardTitle className="text-amber-800">60 Motif Batik Nitik Tradisional</CardTitle>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {filteredPatterns.map((pattern, index) => {
                    const colors = ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#F4A460", "#DAA520"]
                    const bgColor = colors[index % colors.length]
                    const isSelected = selectedPattern === pattern.id.toString()

                    return (
                      <div
                        key={pattern.id}
                        onClick={() => selectPattern(pattern.id.toString())}
                        className={`cursor-pointer border-2 rounded-lg p-2 transition-all hover:shadow-md ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 shadow-md"
                            : "border-amber-200 hover:border-amber-400"
                        }`}
                        title={pattern.name}
                      >
                        <div
                          className="w-full h-20 rounded-md flex items-center justify-center text-white text-xs text-center p-2 mb-2"
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chatbot Modal */}
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
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Tanya tentang batik..."
                    className="border-amber-200 focus:border-amber-500"
                  />
                  <Button onClick={sendChatMessage} className="bg-amber-600 hover:bg-amber-700">
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
