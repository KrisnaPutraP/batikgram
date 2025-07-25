"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Download, Sparkles, MessageCircle } from "lucide-react"

// Complete batik patterns data (60 motifs)
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
  { id: "sekar_srigading", name: "Sekar Srigading", description: "Bunga sri gading yang menjadi simbol kerukunan" },
  { id: "kemukus", name: "Kemukus", description: "Lintang kemukus - bintang berekor yang terlihat di malam hari" },
  { id: "sekar_gudhe", name: "Sekar Gudhe", description: "Bunga tanaman gudhe dari keluarga kacang-kacangan" },
  {
    id: "sekar_ketongkeng",
    name: "Sekar Ketongkeng",
    description: "Sejenis anggrek yang bunganya menyerupai kalajengking",
  },
  { id: "brendi", name: "Brendi", description: "Motif terinspirasi dari simbol minuman brendi dengan 3 koin berjajar" },
  { id: "cakar_ayam", name: "Cakar Ayam", description: "Simbol semangat menyongsong hari esok untuk mencari rejeki" },
  { id: "sekar_menur", name: "Sekar Menur", description: "Bunga menur berwarna putih bersih yang saling menumpuk" },
  { id: "sekar_tebu", name: "Sekar Tebu", description: "Bunga tebu yang dalam bahasa Jawa disebut gleges" },
  { id: "sekar_manggis", name: "Sekar Manggis", description: "Bentuk bunga manggis, ratunya buah" },
  { id: "sekar_randu", name: "Sekar Randu", description: "Tanaman randu yang menghasilkan kapuk" },
  { id: "worawari_rumpuk", name: "Worawari Rumpuk", description: "Bunga sepatu yang bertumpuk (ganda/berlipat)" },
  { id: "sekar_duku", name: "Sekar Duku", description: "Bentuk bunga duku dilihat dari atas" },
  { id: "sekar_jagung", name: "Sekar Jagung", description: "Bunga jagung yang dalam bahasa Jawa disebut sinuwun" },
  { id: "jayakirana", name: "Jayakirana", description: "Senapati Raja Angling Dharma dari kerajaan Malwapati" },
  { id: "mawur", name: "Mawur", description: "Sesuatu yang tersebar berserakan atau tidak menjadi satu" },
  { id: "sekar_tanjung", name: "Sekar Tanjung", description: "Tanaman peneduh yang menghasilkan bunga berbau harum" },
  { id: "sekar_keben", name: "Sekar Keben", description: "Pohon yang dapat tumbuh baik di daerah pantai" },
  {
    id: "sekar_srengenge",
    name: "Sekar Srengenge",
    description: "Bunga matahari yang selalu menghadap ke arah matahari",
  },
  { id: "sekar_soka", name: "Sekar Soka", description: "Tanaman dengan bunga majemuk serumpun berbagai warna" },
  { id: "sekar_nangka", name: "Sekar Nangka", description: "Bunga nangka atau angkup dalam bahasa Jawa" },
  {
    id: "kawung_nitik",
    name: "Kawung Nitik",
    description: "Empat lingkaran yang saling bersinggungan dengan mlinjon di tengahnya",
  },
  { id: "sekar_kentang", name: "Sekar Kentang", description: "Bentuk bunga kentang sebagai ide motif" },
  { id: "sekar_pudak", name: "Sekar Pudak", description: "Tanaman pandan berduri dengan bunga putih beraroma harum" },
  { id: "sekar_dlima", name: "Sekar Dlima", description: "Bentuk bunga delima" },
  { id: "karawitan", name: "Karawitan", description: "Bunga karawitan dan orkestra musik Jawa" },
  { id: "cinde_wilis", name: "Cinde Wilis", description: "Kain sutra hijau bergambar bunga" },
  { id: "sekar_mlati", name: "Sekar Mlati", description: "Bunga melati simbol kesucian" },
  { id: "kuncup_kanthil", name: "Kuncup Kanthil", description: "Bunga kanthil putih yang harum" },
  { id: "sekar_dangan", name: "Sekar Dangan", description: "Dangan berarti sembuh dalam bahasa Jawa halus" },
  { id: "sekar_sawo", name: "Sekar Sawo", description: "Bunga tanaman sawo yang disebut rikuh" },
  { id: "manggar", name: "Manggar", description: "Kelopak bunga kelapa berbentuk rangkaian memanjang" },
  { id: "sekar_cengkeh", name: "Sekar Cengkeh", description: "Bunga cengkeh yang disebut polong" },
  { id: "sritaman", name: "Sritaman", description: "Taman dalam istana para raja" },
  { id: "sekar_mundu", name: "Sekar Mundu", description: "Bunga tanaman mundhu" },
  { id: "sekar_andong", name: "Sekar Andong", description: "Bunga tanaman andong dengan daun merah" },
  { id: "gedhangan", name: "Gedhangan", description: "Wujud tabung untuk menyimpan benda penting" },
  { id: "sekar_pala", name: "Sekar Pala", description: "Bunga tanaman pala dengan biji harum" },
  { id: "klampok_arum", name: "Klampok Arum", description: "Varietas jambu yang manis dan harum" },
  { id: "sekar_jali", name: "Sekar Jali", description: "Bunga tanaman jali dari rumput-rumputan" },
  { id: "sekar_lintang", name: "Sekar Lintang", description: "Lintang berarti bintang, bunganya adalah sinar" },
  { id: "sekar_kenanga", name: "Sekar Kenanga", description: "Bunga kenanga untuk upacara ritual" },
  { id: "sekar_jeruk", name: "Sekar Jeruk", description: "Bunga jeruk yang disebut alon (pelan)" },
  { id: "sekar_mindi", name: "Sekar Mindi", description: "Bunga pohon mindi yang kayunya bermanfaat" },
  { id: "tanjung_gunung", name: "Tanjung Gunung", description: "Tanaman dengan bunga harum dan tajuk peneduh" },
  { id: "sekar_kenikir", name: "Sekar Kenikir", description: "Bunga kenikir untuk kesehatan" },
  { id: "sekar_blimbing", name: "Sekar Blimbing", description: "Bunga tanaman belimbing" },
  { id: "sekar_pijetan", name: "Sekar Pijetan", description: "Buah pijetan yang asam manis menyegarkan" },
  { id: "sarimulat", name: "Sarimulat", description: "Sari adalah inti, mulat berarti mawas diri" },
  { id: "sekar_mrica", name: "Sekar Mrica", description: "Merica yang pedas namun membangkitkan selera" },
  { id: "sekar_kepel", name: "Sekar Kepel", description: "Tanaman kepel dengan buah menempel di batang" },
  { id: "truntum_kurung", name: "Truntum Kurung", description: "Tumaruntum berarti menurun ke generasi berikutnya" },
  { id: "jayakusuma", name: "Jayakusuma", description: "Anak Arjuna yang taat dan pahlawan muda" },
  { id: "rengganis", name: "Rengganis", description: "Tokoh perempuan cantik dalam cerita Menak" },
  { id: "sekar_gambir", name: "Sekar Gambir", description: "Bunga putih bersih sangat harum, kuncup ungu kemerahan" },
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
      pattern.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectPattern = (patternId: string) => {
    setSelectedPattern(patternId)
    const pattern = batikPatterns.find((p) => p.id === patternId)
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
      (p) => lowerMessage.includes(p.name.toLowerCase()) || lowerMessage.includes(p.id.replace(/_/g, " ")),
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
                    <p className="text-amber-700">{batikPatterns.find((p) => p.id === selectedPattern)?.name}</p>
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
                        title={pattern.description}
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
