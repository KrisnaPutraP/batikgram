"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, MessageCircle, Map, Sparkles, ChevronDown, ChevronUp, ArrowRight } from "lucide-react"
import Image from "next/image"

const features = [
  {
    icon: Camera,
    title: "Augmented Reality Dressing",
    description:
      "Coba berbagai motif batik secara virtual dengan teknologi AR terdepan. Lihat bagaimana batik terlihat pada Anda tanpa harus memakainya.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: MessageCircle,
    title: "Virtual Chatbot Teacher",
    description:
      "Pelajari sejarah dan makna filosofis dari 60+ motif batik tradisional dengan bantuan AI teacher yang interaktif dan informatif.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Map,
    title: "Interactive Indonesia Map",
    description:
      "Jelajahi kekayaan batik Nusantara melalui peta interaktif. Klik setiap provinsi untuk mengetahui motif batik khas daerah tersebut.",
    color: "from-red-500 to-amber-600",
  },
  {
    icon: Sparkles,
    title: "Cultural Heritage Archive",
    description:
      "Akses koleksi lengkap motif batik tradisional dengan dokumentasi sejarah, teknik pembuatan, dan nilai budaya yang terkandung di dalamnya.",
    color: "from-amber-600 to-orange-500",
  },
]

const faqs = [
  {
    question: "Apa itu BatikGram?",
    answer:
      "BatikGram adalah aplikasi inovatif yang menggabungkan teknologi Augmented Reality dengan kekayaan budaya batik Indonesia. Kami memungkinkan Anda untuk mencoba berbagai motif batik secara virtual dan mempelajari sejarah serta makna filosofis di baliknya.",
  },
  {
    question: "Bagaimana cara kerja fitur AR Virtual Dressing?",
    answer:
      "Cukup ambil foto diri Anda menggunakan kamera, lalu pilih motif batik yang diinginkan. Teknologi AI kami akan menerapkan motif batik tersebut pada pakaian Anda secara realistis dalam hitungan detik.",
  },
  {
    question: "Berapa banyak motif batik yang tersedia?",
    answer:
      "Kami menyediakan lebih dari 60 motif batik tradisional dari berbagai daerah di Indonesia, termasuk Batik Nitik, Kawung, Parang, Ceplok, dan masih banyak lagi. Koleksi kami terus bertambah.",
  },
  {
    question: "Apakah aplikasi ini gratis?",
    answer:
      "Ya, BatikGram dapat digunakan secara gratis. Kami berkomitmen untuk melestarikan dan memperkenalkan budaya batik Indonesia kepada generasi muda dan dunia internasional.",
  },
  {
    question: "Bisakah saya menyimpan hasil foto virtual try-on?",
    answer:
      "Tentu saja! Anda dapat menyimpan hasil foto virtual try-on ke galeri perangkat Anda dan membagikannya di media sosial untuk memperkenalkan keindahan batik Indonesia.",
  },
  {
    question: "Apakah ada informasi tentang sejarah setiap motif batik?",
    answer:
      "Ya, setiap motif batik dilengkapi dengan informasi lengkap tentang sejarah, makna filosofis, asal daerah, dan teknik pembuatannya. Chatbot AI kami siap menjawab pertanyaan Anda tentang batik.",
  },
]

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const router = useRouter()

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const startExperience = () => {
    router.push("/camera")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Batik Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 bg-amber-600 rounded-full"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-red-600 rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-48 h-48 bg-orange-600 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-36 h-36 bg-yellow-600 rounded-full"></div>

        {/* Batik-inspired geometric patterns */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 border-4 border-amber-400 rotate-45 opacity-30"></div>
        <div className="absolute top-3/4 right-1/4 w-20 h-20 border-4 border-red-400 rotate-12 opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-12 h-12 border-4 border-orange-400 rotate-45 opacity-30"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Image
              src="/images/batikgram-logo.png"
              alt="BatikGram Logo"
              width={200}
              height={200}
              className="mx-auto mb-6 drop-shadow-lg"
            />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-800 to-red-800 bg-clip-text text-transparent mb-4">
              BatikGram
            </h1>
            <p className="text-xl md:text-2xl text-amber-700 font-medium mb-2">Experience Batik Culture Virtually</p>
            <p className="text-lg text-amber-600 mb-8 max-w-2xl mx-auto">"FROM ANCIENT MOTIFS TO MODERN MOVES"</p>
          </div>

          <Button
            onClick={startExperience}
            className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-bold py-4 px-8 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Mulai Pengalaman Batik
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-amber-800 to-red-800 bg-clip-text text-transparent mb-12">
            Fitur Unggulan BatikGram
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:scale-105"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-amber-800 group-hover:text-amber-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-amber-800 to-red-800 bg-clip-text text-transparent mb-12">
            Pertanyaan yang Sering Diajukan
          </h2>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader
                  className="cursor-pointer hover:bg-amber-50 transition-colors duration-200"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-amber-800 text-left">{faq.question}</CardTitle>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-amber-700 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
