"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, RotateCcw, Sparkles } from "lucide-react"

export default function CameraPage() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  // Update API URL untuk mencocokkan dengan backend Flask
  // Ganti semua referensi API_URL dari 'http://localhost:5000' ke '/api'
  // 1. Di bagian atas file, ganti:
  // const API_URL = 'http://localhost:5000'
  // const API_URL = '/api'

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
      console.error("Camera error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)

    // Store the captured image in sessionStorage to pass to next page
    sessionStorage.setItem("capturedImage", imageData)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    sessionStorage.removeItem("capturedImage")
  }

  const proceedToPatterns = () => {
    if (capturedImage) {
      router.push("/patterns")
    }
  }

  // 2. Update tombol "Kembali" untuk tidak mengarah ke login:
  const goBack = () => {
    // Hapus fungsi goBack atau arahkan ke halaman lain jika diperlukan
    // Untuk sementara, bisa di-disable atau redirect ke home
    window.location.reload()
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
        {/* 3. Update header untuk menghapus tombol kembali: */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-20"></div> {/* Spacer kosong */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent">
            Ambil Foto Anda
          </h1>
          <div className="w-20"></div> {/* Spacer kosong */}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pb-8">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-amber-800">
              <Camera className="w-6 h-6" />
              <span>Kamera Virtual Try-On</span>
            </CardTitle>
            <p className="text-amber-600">Posisikan diri Anda dengan baik untuk hasil terbaik</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Camera/Photo Display */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
              {!capturedImage ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-96 object-cover"
                    style={{ transform: "scaleX(-1)" }} // Mirror effect
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Memuat kamera...</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
                      <div className="text-white text-center p-4">
                        <p className="mb-2">{error}</p>
                        <Button onClick={startCamera} variant="secondary" size="sm">
                          Coba Lagi
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Camera guide overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/50"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/50"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50"></div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Foto Berhasil
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              {!capturedImage ? (
                <Button
                  onClick={capturePhoto}
                  disabled={isLoading || !!error}
                  className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold px-8 py-3 shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Ambil Foto
                </Button>
              ) : (
                <div className="flex space-x-4">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 px-6 py-3 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Foto Ulang
                  </Button>
                  <Button
                    onClick={proceedToPatterns}
                    className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold px-8 py-3 shadow-lg"
                  >
                    Pilih Motif Batik
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2">Tips untuk Hasil Terbaik:</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Pastikan pencahayaan cukup terang</li>
                <li>• Berdiri tegak menghadap kamera</li>
                <li>• Gunakan latar belakang yang kontras</li>
                <li>• Pastikan seluruh tubuh terlihat dalam frame</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
