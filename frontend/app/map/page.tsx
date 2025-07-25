"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Map, Info, X, MapPin } from "lucide-react"

// Indonesian provinces data
const provinces = [
  {
    id: "aceh",
    name: "Aceh",
    capital: "Banda Aceh",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Pintu Aceh", "Bungong Jeumpa", "Rencong", "Pinto Aceh"],
      description:
        "Batik Aceh memadukan motif Islam dengan budaya lokal Acehnese yang kental dengan nilai-nilai religius.",
      characteristics:
        "Didominasi motif geometris Islam, kaligrafi Arab, dan ornamen masjid dengan warna hijau dan emas.",
      history: "Berkembang sejak era Kesultanan Aceh sebagai pusat penyebaran Islam di Nusantara.",
    },
  },
  {
    id: "sumut",
    name: "Sumatera Utara",
    capital: "Medan",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Gorga Batak", "Ulos", "Simalungun", "Mandailing"],
      description:
        "Batik Sumatera Utara terinspirasi dari ornamen Batak dan budaya Melayu dengan motif yang kuat dan bermakna.",
      characteristics:
        "Motif Gorga Batak dengan warna merah, hitam, dan putih yang melambangkan kehidupan, kematian, dan kesucian.",
      history: "Berkembang dari ornamen tradisional Batak yang diadaptasi ke dalam teknik batik modern.",
    },
  },
  {
    id: "sumbar",
    name: "Sumatera Barat",
    capital: "Padang",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Pucuk Rebung", "Kaluak Paku", "Bungo Tanjung", "Saik Galamai"],
      description:
        "Batik Minangkabau dengan filosofi alam takambang jadi guru, setiap motif terinspirasi dari alam Sumatera Barat.",
      characteristics: "Motif flora dan fauna dengan warna-warna natural yang mencerminkan kearifan lokal Minangkabau.",
      history: "Berkembang dari songket dan tenun tradisional Minangkabau yang diadaptasi ke batik.",
    },
  },
  {
    id: "riau",
    name: "Riau",
    capital: "Pekanbaru",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Tabir", "Melayu Riau", "Lancang Kuning", "Tepak Sirih"],
      description:
        "Batik Riau kental dengan budaya Melayu, motif-motifnya mencerminkan kehidupan masyarakat pesisir dan sungai.",
      characteristics: "Warna kuning emas dominan dengan motif perahu, gelombang, dan ornamen istana Melayu.",
      history: "Berkembang di lingkungan Kesultanan Siak dan pengaruh budaya Melayu yang kuat.",
    },
  },
  {
    id: "jambi",
    name: "Jambi",
    capital: "Jambi",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Angso Duo", "Bungo Tebo", "Durian Pecah", "Kaca Piring"],
      description: "Batik Jambi terkenal dengan motif Angso Duo yang melambangkan keseimbangan dan keharmonisan hidup.",
      characteristics: "Perpaduan warna merah dan biru dengan motif yang simetris dan penuh makna filosofis.",
      history: "Berkembang dari tradisi tenun songket Jambi yang kemudian diadaptasi ke teknik batik.",
    },
  },
  {
    id: "sumsel",
    name: "Sumatera Selatan",
    capital: "Palembang",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Songket Palembang", "Bungo Pacik", "Lepus", "Nago Besaung"],
      description:
        "Batik Palembang memadukan kemewahan songket dengan teknik batik, menciptakan karya seni yang elegan.",
      characteristics: "Warna emas dan merah dengan motif yang mewah, mencerminkan kejayaan Kesultanan Palembang.",
      history: "Berkembang dari tradisi songket Palembang sejak era Kesultanan Palembang Darussalam.",
    },
  },
  {
    id: "bengkulu",
    name: "Bengkulu",
    capital: "Bengkulu",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Rafflesia", "Burung Kuau", "Kain Besurek", "Relung Paku"],
      description:
        "Batik Bengkulu terinspirasi dari flora dan fauna khas daerah, terutama bunga Rafflesia yang ikonik.",
      characteristics: "Motif bunga besar dengan warna-warna cerah yang mencerminkan kekayaan alam Bengkulu.",
      history: "Berkembang dari kain besurek tradisional dengan pengaruh Arab dan Melayu.",
    },
  },
  {
    id: "lampung",
    name: "Lampung",
    capital: "Bandar Lampung",
    island: "Sumatra",
    batikInfo: {
      motifs: ["Siger", "Jung Sarat", "Pucuk Rebung", "Tampuk Manggis"],
      description: "Batik Lampung didominasi motif Siger (mahkota adat) yang melambangkan keagungan dan martabat.",
      characteristics: "Warna kuning emas dengan motif mahkota dan ornamen adat yang megah dan bermartabat.",
      history: "Berkembang dari tapis (kain tradisional Lampung) yang diadaptasi ke teknik batik modern.",
    },
  },
  {
    id: "jakarta",
    name: "DKI Jakarta",
    capital: "Jakarta",
    island: "Java",
    batikInfo: {
      motifs: ["Ondel-ondel", "Nusa Kelapa", "Rasamala", "Betawi"],
      description: "Batik Betawi menggambarkan kehidupan masyarakat Jakarta dengan motif-motif khas budaya Betawi.",
      characteristics: "Warna-warna cerah dengan motif yang menggambarkan kehidupan urban dan tradisi Betawi.",
      history: "Batik Betawi berkembang sebagai representasi budaya Jakarta yang multikultural.",
    },
  },
  {
    id: "jabar",
    name: "Jawa Barat",
    capital: "Bandung",
    island: "Java",
    batikInfo: {
      motifs: ["Mega Mendung", "Trusmi", "Garutan", "Ciamisan"],
      description: "Jawa Barat terkenal dengan batik Cirebon yang memiliki pengaruh Tionghoa dan Arab.",
      characteristics: "Warna-warna cerah dengan motif awan (mega mendung) dan pengaruh budaya pesisir.",
      history: "Batik Jawa Barat berkembang di Cirebon sebagai kota pelabuhan dengan pengaruh multikultural.",
    },
  },
  {
    id: "jateng",
    name: "Jawa Tengah",
    capital: "Semarang",
    island: "Java",
    batikInfo: {
      motifs: ["Kawung", "Parang", "Sidomukti", "Sidoluruh"],
      description:
        "Jawa Tengah adalah pusat batik klasik Indonesia dengan motif-motif keraton yang penuh makna filosofis.",
      characteristics:
        "Warna-warna natural seperti coklat sogan, indigo, dan putih dengan motif geometris yang teratur.",
      history: "Batik Jawa Tengah berkembang sejak abad ke-13 di lingkungan keraton Solo dan Yogyakarta.",
    },
  },
  {
    id: "yogya",
    name: "D.I. Yogyakarta",
    capital: "Yogyakarta",
    island: "Java",
    batikInfo: {
      motifs: ["Parang Rusak", "Kawung", "Nitik", "Ceplok"],
      description: "Yogyakarta adalah gudangnya batik klasik dengan motif-motif yang sakral dan penuh filosofi Jawa.",
      characteristics: "Didominasi warna sogan (coklat) dan indigo dengan motif yang sangat teratur dan bermakna.",
      history: "Batik Yogyakarta berkembang di Keraton Ngayogyakarta sejak Sultan Hamengku Buwono I.",
    },
  },
  {
    id: "jatim",
    name: "Jawa Timur",
    capital: "Surabaya",
    island: "Java",
    batikInfo: {
      motifs: ["Sekar Jagad", "Buketan", "Loceng", "Rembang"],
      description: "Jawa Timur memiliki batik dengan karakteristik warna-warna cerah dan motif yang beragam.",
      characteristics: "Perpaduan motif klasik dan modern dengan warna-warna yang lebih berani dan kontras.",
      history: "Batik Jawa Timur berkembang di daerah Madura, Tuban, dan Ponorogo dengan ciri khas masing-masing.",
    },
  },
  {
    id: "banten",
    name: "Banten",
    capital: "Serang",
    island: "Java",
    batikInfo: {
      motifs: ["Surosowan", "Sabakingking", "Gedong Gincu"],
      description: "Batik Banten memiliki motif yang terinspirasi dari sejarah Kesultanan Banten.",
      characteristics: "Motif yang menggambarkan kekuatan maritim dan perdagangan dengan warna-warna elegan.",
      history: "Berkembang sejak era Kesultanan Banten sebagai pusat perdagangan dan penyebaran Islam.",
    },
  },
  {
    id: "kalbar",
    name: "Kalimantan Barat",
    capital: "Pontianak",
    island: "Kalimantan",
    batikInfo: {
      motifs: ["Dayak", "Insang", "Burung Enggang", "Kaharingan"],
      description: "Batik Kalimantan Barat terinspirasi dari budaya Dayak dengan motif-motif alam dan spiritual.",
      characteristics: "Motif-motif tribal dengan warna-warna natural yang menggambarkan kehidupan di hutan.",
      history: "Berkembang dari ornamen tradisional suku Dayak yang diadaptasi ke dalam teknik batik.",
    },
  },
  {
    id: "kalteng",
    name: "Kalimantan Tengah",
    capital: "Palangka Raya",
    island: "Kalimantan",
    batikInfo: {
      motifs: ["Benang Bintik", "Dayak Ngaju", "Tambun Bungai", "Huma Betang"],
      description:
        "Batik Kalimantan Tengah menggambarkan kehidupan suku Dayak Ngaju dengan rumah Betang sebagai inspirasi.",
      characteristics: "Motif rumah adat dan ornamen Dayak dengan warna coklat tanah dan hijau hutan.",
      history: "Berkembang dari ukiran dan ornamen rumah Betang suku Dayak Ngaju.",
    },
  },
  {
    id: "kalsel",
    name: "Kalimantan Selatan",
    capital: "Banjarmasin",
    island: "Kalimantan",
    batikInfo: {
      motifs: ["Sasirangan", "Kulat Kurikit", "Bayam Raja", "Hiris Gagatas"],
      description: "Batik Sasirangan Banjar dengan teknik ikat celup yang menghasilkan motif unik dan khas.",
      characteristics: "Teknik sasirangan dengan warna-warna cerah dan motif yang terbentuk dari ikatan benang.",
      history: "Sasirangan adalah teknik tradisional Banjar yang telah ada sejak abad ke-12.",
    },
  },
  {
    id: "kaltim",
    name: "Kalimantan Timur",
    capital: "Samarinda",
    island: "Kalimantan",
    batikInfo: {
      motifs: ["Dayak Kenyah", "Hudoq", "Mahakam", "Pesut"],
      description:
        "Batik Kalimantan Timur terinspirasi dari budaya Dayak Kenyah dan kehidupan di sepanjang Sungai Mahakam.",
      characteristics: "Motif hewan langka seperti pesut dan ornamen Dayak dengan warna-warna natural.",
      history: "Berkembang dari ornamen tradisional suku Dayak Kenyah di sepanjang Sungai Mahakam.",
    },
  },
  {
    id: "kalut",
    name: "Kalimantan Utara",
    capital: "Tanjung Selor",
    island: "Kalimantan",
    batikInfo: {
      motifs: ["Dayak Tidung", "Gong", "Mandau", "Bulungan"],
      description:
        "Batik Kalimantan Utara menggambarkan budaya Dayak Tidung dengan motif senjata tradisional dan gong.",
      characteristics: "Motif senjata tradisional dan alat musik dengan warna gelap yang mencerminkan kekuatan.",
      history: "Berkembang dari ornamen suku Dayak Tidung dan Bulungan di wilayah perbatasan.",
    },
  },
  {
    id: "sulut",
    name: "Sulawesi Utara",
    capital: "Manado",
    island: "Sulawesi",
    batikInfo: {
      motifs: ["Minahasa", "Waruga", "Kabasaran", "Bunaken"],
      description:
        "Batik Sulawesi Utara menggambarkan budaya Minahasa dengan motif-motif yang kaya akan nilai spiritual.",
      characteristics: "Motif tradisional Minahasa dengan warna-warna cerah yang mencerminkan kehidupan pesisir.",
      history: "Berkembang dari ornamen tradisional suku Minahasa dan pengaruh budaya Kristen.",
    },
  },
  {
    id: "sulteng",
    name: "Sulawesi Tengah",
    capital: "Palu",
    island: "Sulawesi",
    batikInfo: {
      motifs: ["Kaili", "Donggala", "Poso", "Tolitoli"],
      description: "Batik Sulawesi Tengah terinspirasi dari budaya suku Kaili dengan motif-motif alam pegunungan.",
      characteristics: "Motif pegunungan dan lembah dengan warna-warna natural yang mencerminkan alam Sulawesi Tengah.",
      history: "Berkembang dari tenun tradisional suku Kaili yang diadaptasi ke teknik batik.",
    },
  },
  {
    id: "sulsel",
    name: "Sulawesi Selatan",
    capital: "Makassar",
    island: "Sulawesi",
    batikInfo: {
      motifs: ["Bugis", "Makassar", "Toraja", "Bone"],
      description: "Batik Sulawesi Selatan memadukan budaya Bugis-Makassar dengan ornamen Toraja yang unik.",
      characteristics: "Motif perahu pinisi dan ornamen Toraja dengan warna-warna yang mencerminkan budaya maritim.",
      history: "Berkembang dari tradisi tenun Bugis-Makassar dan ornamen ukiran Toraja.",
    },
  },
  {
    id: "sulbar",
    name: "Sulawesi Barat",
    capital: "Mamuju",
    island: "Sulawesi",
    batikInfo: {
      motifs: ["Mandar", "Mamuju", "Polewali", "Majene"],
      description: "Batik Sulawesi Barat menggambarkan budaya suku Mandar dengan motif-motif pesisir barat Sulawesi.",
      characteristics: "Motif gelombang laut dan perahu tradisional dengan warna biru dan putih dominan.",
      history: "Berkembang dari tradisi tenun suku Mandar di pesisir barat Sulawesi.",
    },
  },
  {
    id: "gorontalo",
    name: "Gorontalo",
    capital: "Gorontalo",
    island: "Sulawesi",
    batikInfo: {
      motifs: ["Karawo", "Gorontalo", "Bilante", "Iluto"],
      description: "Batik Gorontalo terkenal dengan motif Karawo yang merupakan sulaman tradisional khas Gorontalo.",
      characteristics: "Motif sulaman Karawo dengan warna-warna cerah dan pola geometris yang rumit.",
      history: "Berkembang dari tradisi sulaman Karawo yang kemudian diadaptasi ke teknik batik.",
    },
  },
  {
    id: "sultara",
    name: "Sulawesi Tenggara",
    capital: "Kendari",
    island: "Sulawesi",
    batikInfo: {
      motifs: ["Tolaki", "Buton", "Muna", "Wakatobi"],
      description: "Batik Sulawesi Tenggara menggambarkan budaya suku Tolaki dan keindahan alam bawah laut Wakatobi.",
      characteristics: "Motif bawah laut dan ornamen tradisional Tolaki dengan warna-warna laut yang indah.",
      history: "Berkembang dari ornamen tradisional suku Tolaki dan keindahan alam Wakatobi.",
    },
  },
  {
    id: "bali",
    name: "Bali",
    capital: "Denpasar",
    island: "Bali",
    batikInfo: {
      motifs: ["Prada", "Endek", "Gringsing", "Poleng"],
      description: "Batik Bali memadukan motif Hindu-Bali dengan teknik batik Jawa yang menghasilkan karya seni unik.",
      characteristics: "Motif-motif Hindu dengan warna emas (prada) dan filosofi Tri Hita Karana.",
      history: "Batik Bali berkembang sebagai adaptasi budaya Jawa dengan nilai-nilai Hindu-Bali.",
    },
  },
  {
    id: "ntb",
    name: "Nusa Tenggara Barat",
    capital: "Mataram",
    island: "Nusa Tenggara",
    batikInfo: {
      motifs: ["Lombok", "Sumbawa", "Sasak", "Tenun Ikat"],
      description: "Batik NTB menggambarkan budaya suku Sasak dan Sumbawa dengan motif-motif tradisional yang khas.",
      characteristics: "Motif tenun ikat tradisional dengan warna-warna natural yang mencerminkan budaya lokal.",
      history: "Berkembang dari tradisi tenun ikat suku Sasak dan Sumbawa yang diadaptasi ke batik.",
    },
  },
  {
    id: "ntt",
    name: "Nusa Tenggara Timur",
    capital: "Kupang",
    island: "Nusa Tenggara",
    batikInfo: {
      motifs: ["Flores", "Timor", "Sumba", "Tenun Ikat"],
      description: "Batik NTT kaya akan motif tenun ikat tradisional dari berbagai suku di Nusa Tenggara Timur.",
      characteristics: "Motif tenun ikat dengan warna-warna natural dan pola geometris yang rumit.",
      history: "Berkembang dari tradisi tenun ikat yang telah ada sejak ratusan tahun di NTT.",
    },
  },
  {
    id: "papua",
    name: "Papua",
    capital: "Jayapura",
    island: "Papua",
    batikInfo: {
      motifs: ["Asmat", "Dani", "Sentani", "Cenderawasih"],
      description:
        "Batik Papua menggambarkan kekayaan budaya suku-suku asli Papua dengan motif-motif alam dan spiritual.",
      characteristics: "Motif burung Cenderawasih dan ornamen suku Asmat dengan warna-warna natural hutan Papua.",
      history: "Berkembang dari ornamen tradisional suku-suku Papua yang diadaptasi ke teknik batik modern.",
    },
  },
  {
    id: "papbar",
    name: "Papua Barat",
    capital: "Manokwari",
    island: "Papua",
    batikInfo: {
      motifs: ["Arfak", "Raja Ampat", "Manokwari", "Sorong"],
      description: "Batik Papua Barat terinspirasi dari keindahan alam Raja Ampat dan budaya suku Arfak.",
      characteristics: "Motif bawah laut Raja Ampat dan ornamen pegunungan Arfak dengan warna-warna laut tropis.",
      history: "Berkembang dari ornamen tradisional suku Arfak dan keindahan alam Raja Ampat.",
    },
  },
  {
    id: "maluku",
    name: "Maluku",
    capital: "Ambon",
    island: "Maluku",
    batikInfo: {
      motifs: ["Ambon", "Seram", "Banda", "Rempah"],
      description: "Batik Maluku menggambarkan sejarah kepulauan rempah dengan motif-motif maritim dan perdagangan.",
      characteristics:
        "Motif rempah-rempah dan perahu tradisional dengan warna-warna hangat seperti kunyit dan cengkeh.",
      history: "Berkembang dari sejarah perdagangan rempah di Kepulauan Maluku sejak era kolonial.",
    },
  },
  {
    id: "malut",
    name: "Maluku Utara",
    capital: "Ternate",
    island: "Maluku",
    batikInfo: {
      motifs: ["Ternate", "Tidore", "Halmahera", "Cengkeh"],
      description:
        "Batik Maluku Utara terinspirasi dari sejarah Kesultanan Ternate dan Tidore sebagai pusat rempah dunia.",
      characteristics: "Motif kesultanan dan rempah cengkeh dengan warna emas dan merah yang mewah.",
      history: "Berkembang dari ornamen kesultanan Ternate-Tidore dan tradisi perdagangan cengkeh.",
    },
  },
]

export default function MapPage() {
  const [selectedProvince, setSelectedProvince] = useState<(typeof provinces)[0] | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)

  const handleProvinceClick = (province: (typeof provinces)[0]) => {
    setSelectedProvince(province)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProvince(null)
  }

  const getProvinceColor = (provinceId: string) => {
    if (hoveredProvince === provinceId) {
      return "#f59e0b" // amber-500
    }
    return "#dc2626" // red-600
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Batik Pattern Background - matching app theme */}
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent mb-2">
            Peta Batik Nusantara
          </h1>
          <p className="text-amber-600">Jelajahi kekayaan batik dari berbagai daerah di Indonesia</p>
        </div>

        {/* Map Container */}
        <Card className="max-w-7xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <Map className="w-6 h-6" />
              <span>Peta Interaktif Indonesia</span>
            </CardTitle>
            <p className="text-amber-600 text-sm">
              Klik pada setiap provinsi untuk mengetahui informasi batik daerah tersebut
            </p>
          </CardHeader>

          <CardContent>
            {/* SVG Map */}
            <div className="w-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-8 shadow-inner">
              <svg viewBox="0 0 1000 600" className="w-full h-auto">
                {/* Ocean background */}
                <rect width="1000" height="600" fill="url(#oceanGradient)" />

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dbeafe" />
                    <stop offset="100%" stopColor="#bfdbfe" />
                  </linearGradient>
                </defs>

                {/* SUMATRA */}
                <g id="sumatra">
                  {/* Aceh */}
                  <path
                    d="M 80 80 L 120 70 L 140 90 L 130 120 L 100 130 L 80 110 Z"
                    fill={getProvinceColor("aceh")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "aceh")!)}
                    onMouseEnter={() => setHoveredProvince("aceh")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sumatera Utara */}
                  <path
                    d="M 80 110 L 130 120 L 150 140 L 140 170 L 110 180 L 80 160 Z"
                    fill={getProvinceColor("sumut")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sumut")!)}
                    onMouseEnter={() => setHoveredProvince("sumut")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sumatera Barat */}
                  <path
                    d="M 60 160 L 110 180 L 120 210 L 90 230 L 60 220 L 50 190 Z"
                    fill={getProvinceColor("sumbar")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sumbar")!)}
                    onMouseEnter={() => setHoveredProvince("sumbar")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Riau */}
                  <path
                    d="M 110 180 L 160 170 L 180 200 L 160 230 L 120 240 L 90 230 L 110 180 Z"
                    fill={getProvinceColor("riau")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "riau")!)}
                    onMouseEnter={() => setHoveredProvince("riau")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Jambi */}
                  <path
                    d="M 90 230 L 160 230 L 170 260 L 140 280 L 100 270 L 80 250 Z"
                    fill={getProvinceColor("jambi")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "jambi")!)}
                    onMouseEnter={() => setHoveredProvince("jambi")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sumatera Selatan */}
                  <path
                    d="M 100 270 L 170 260 L 180 290 L 160 320 L 120 330 L 90 310 Z"
                    fill={getProvinceColor("sumsel")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sumsel")!)}
                    onMouseEnter={() => setHoveredProvince("sumsel")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Bengkulu */}
                  <path
                    d="M 50 250 L 90 270 L 90 310 L 70 330 L 40 320 L 30 290 Z"
                    fill={getProvinceColor("bengkulu")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "bengkulu")!)}
                    onMouseEnter={() => setHoveredProvince("bengkulu")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Lampung */}
                  <path
                    d="M 90 310 L 160 320 L 170 350 L 140 370 L 100 360 L 70 340 Z"
                    fill={getProvinceColor("lampung")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "lampung")!)}
                    onMouseEnter={() => setHoveredProvince("lampung")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* JAVA */}
                <g id="java">
                  {/* Banten */}
                  <path
                    d="M 200 380 L 240 375 L 250 395 L 230 410 L 200 405 Z"
                    fill={getProvinceColor("banten")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "banten")!)}
                    onMouseEnter={() => setHoveredProvince("banten")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* DKI Jakarta */}
                  <path
                    d="M 240 375 L 260 370 L 270 385 L 250 395 Z"
                    fill={getProvinceColor("jakarta")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "jakarta")!)}
                    onMouseEnter={() => setHoveredProvince("jakarta")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Jawa Barat */}
                  <path
                    d="M 250 395 L 320 390 L 340 410 L 310 430 L 250 425 L 230 410 Z"
                    fill={getProvinceColor("jabar")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "jabar")!)}
                    onMouseEnter={() => setHoveredProvince("jabar")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Jawa Tengah */}
                  <path
                    d="M 320 390 L 420 385 L 440 405 L 410 425 L 340 430 L 320 410 Z"
                    fill={getProvinceColor("jateng")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "jateng")!)}
                    onMouseEnter={() => setHoveredProvince("jateng")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* D.I. Yogyakarta */}
                  <path
                    d="M 360 425 L 390 420 L 400 435 L 380 445 L 360 440 Z"
                    fill={getProvinceColor("yogya")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "yogya")!)}
                    onMouseEnter={() => setHoveredProvince("yogya")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Jawa Timur */}
                  <path
                    d="M 420 385 L 520 380 L 540 400 L 510 420 L 440 425 L 420 405 Z"
                    fill={getProvinceColor("jatim")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "jatim")!)}
                    onMouseEnter={() => setHoveredProvince("jatim")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* KALIMANTAN */}
                <g id="kalimantan">
                  {/* Kalimantan Barat */}
                  <path
                    d="M 250 200 L 320 195 L 340 220 L 320 250 L 280 260 L 250 240 Z"
                    fill={getProvinceColor("kalbar")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "kalbar")!)}
                    onMouseEnter={() => setHoveredProvince("kalbar")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Kalimantan Utara */}
                  <path
                    d="M 320 195 L 380 190 L 400 210 L 380 230 L 340 235 L 320 220 Z"
                    fill={getProvinceColor("kalut")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "kalut")!)}
                    onMouseEnter={() => setHoveredProvince("kalut")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Kalimantan Timur */}
                  <path
                    d="M 380 190 L 450 185 L 470 210 L 450 240 L 400 245 L 380 230 Z"
                    fill={getProvinceColor("kaltim")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "kaltim")!)}
                    onMouseEnter={() => setHoveredProvince("kaltim")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Kalimantan Tengah */}
                  <path
                    d="M 320 220 L 380 230 L 400 260 L 370 280 L 320 275 L 300 250 Z"
                    fill={getProvinceColor("kalteng")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "kalteng")!)}
                    onMouseEnter={() => setHoveredProvince("kalteng")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Kalimantan Selatan */}
                  <path
                    d="M 370 280 L 420 275 L 440 300 L 410 320 L 370 315 L 350 295 Z"
                    fill={getProvinceColor("kalsel")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "kalsel")!)}
                    onMouseEnter={() => setHoveredProvince("kalsel")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* SULAWESI */}
                <g id="sulawesi">
                  {/* Sulawesi Utara */}
                  <path
                    d="M 580 180 L 620 175 L 640 195 L 620 215 L 580 210 L 560 190 Z"
                    fill={getProvinceColor("sulut")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sulut")!)}
                    onMouseEnter={() => setHoveredProvince("sulut")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Gorontalo */}
                  <path
                    d="M 620 175 L 650 170 L 670 190 L 650 210 L 620 205 L 600 185 Z"
                    fill={getProvinceColor("gorontalo")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "gorontalo")!)}
                    onMouseEnter={() => setHoveredProvince("gorontalo")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sulawesi Tengah */}
                  <path
                    d="M 560 210 L 600 205 L 620 230 L 590 250 L 550 245 L 530 225 Z"
                    fill={getProvinceColor("sulteng")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sulteng")!)}
                    onMouseEnter={() => setHoveredProvince("sulteng")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sulawesi Barat */}
                  <path
                    d="M 520 280 L 550 275 L 570 295 L 540 315 L 510 310 L 490 290 Z"
                    fill={getProvinceColor("sulbar")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sulbar")!)}
                    onMouseEnter={() => setHoveredProvince("sulbar")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sulawesi Selatan */}
                  <path
                    d="M 550 315 L 590 310 L 610 335 L 580 355 L 540 350 L 520 330 Z"
                    fill={getProvinceColor("sulsel")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sulsel")!)}
                    onMouseEnter={() => setHoveredProvince("sulsel")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Sulawesi Tenggara */}
                  <path
                    d="M 610 335 L 650 330 L 670 350 L 640 370 L 600 365 L 580 345 Z"
                    fill={getProvinceColor("sultara")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "sultara")!)}
                    onMouseEnter={() => setHoveredProvince("sultara")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* BALI & NUSA TENGGARA */}
                <g id="bali-nusa-tenggara">
                  {/* Bali */}
                  <path
                    d="M 540 420 L 570 415 L 580 435 L 560 445 L 540 440 Z"
                    fill={getProvinceColor("bali")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "bali")!)}
                    onMouseEnter={() => setHoveredProvince("bali")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Nusa Tenggara Barat */}
                  <path
                    d="M 580 435 L 620 430 L 640 450 L 610 470 L 580 465 L 560 445 Z"
                    fill={getProvinceColor("ntb")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "ntb")!)}
                    onMouseEnter={() => setHoveredProvince("ntb")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Nusa Tenggara Timur */}
                  <path
                    d="M 640 450 L 720 445 L 740 465 L 710 485 L 640 480 L 620 460 Z"
                    fill={getProvinceColor("ntt")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "ntt")!)}
                    onMouseEnter={() => setHoveredProvince("ntt")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* MALUKU */}
                <g id="maluku">
                  {/* Maluku Utara */}
                  <path
                    d="M 700 280 L 730 275 L 750 295 L 720 315 L 690 310 L 670 290 Z"
                    fill={getProvinceColor("malut")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "malut")!)}
                    onMouseEnter={() => setHoveredProvince("malut")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Maluku */}
                  <path
                    d="M 720 340 L 760 335 L 780 355 L 750 375 L 720 370 L 700 350 Z"
                    fill={getProvinceColor("maluku")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "maluku")!)}
                    onMouseEnter={() => setHoveredProvince("maluku")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* PAPUA */}
                <g id="papua">
                  {/* Papua Barat */}
                  <path
                    d="M 780 280 L 840 275 L 860 300 L 830 325 L 780 320 L 760 295 Z"
                    fill={getProvinceColor("papbar")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "papbar")!)}
                    onMouseEnter={() => setHoveredProvince("papbar")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />

                  {/* Papua */}
                  <path
                    d="M 830 325 L 920 320 L 950 350 L 920 380 L 830 375 L 800 345 Z"
                    fill={getProvinceColor("papua")}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onClick={() => handleProvinceClick(provinces.find((p) => p.id === "papua")!)}
                    onMouseEnter={() => setHoveredProvince("papua")}
                    onMouseLeave={() => setHoveredProvince(null)}
                  />
                </g>

                {/* Province Labels */}
                {hoveredProvince && (
                  <text x="500" y="50" textAnchor="middle" className="fill-amber-800 text-lg font-bold">
                    {provinces.find((p) => p.id === hoveredProvince)?.name}
                  </text>
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
              <h4 className="font-bold text-amber-800 mb-3 text-sm flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Legenda Peta
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-600 fill-red-600" />
                  <span className="text-amber-700 font-medium">Provinsi Indonesia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-amber-700 font-medium">Provinsi Aktif</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-amber-700 font-medium">Klik untuk Detail Batik</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-amber-700 font-medium">Total: {provinces.length} Provinsi</div>
                </div>
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {provinces.slice(0, 12).map((province) => (
                <Button
                  key={province.id}
                  variant="outline"
                  onClick={() => handleProvinceClick(province)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs p-2 h-auto bg-white/80 hover:border-amber-500 transition-all duration-200"
                >
                  <div className="text-center">
                    <MapPin className="w-3 h-3 text-red-600 fill-red-600 mx-auto mb-1" />
                    <div className="font-medium">{province.name}</div>
                    <div className="text-xs opacity-70">{province.capital}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Province Info Modal */}
        {showModal && selectedProvince && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-amber-800 flex items-center">
                      <MapPin className="w-4 h-4 text-red-600 fill-red-600 mr-3" />
                      {selectedProvince.name}
                    </CardTitle>
                    <p className="text-amber-600 mt-1">
                      <span className="font-medium">Ibukota:</span> {selectedProvince.capital}
                    </p>
                    <p className="text-amber-600 text-sm">
                      <span className="font-medium">Pulau:</span> {selectedProvince.island}
                    </p>
                  </div>
                  <Button onClick={closeModal} variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-100">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Description */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center text-lg">
                    <Info className="w-5 h-5 mr-2" />
                    Tentang Batik {selectedProvince.name}
                  </h3>
                  <p className="text-amber-700 leading-relaxed">{selectedProvince.batikInfo.description}</p>
                </div>

                {/* Motifs Grid */}
                <div>
                  <h3 className="font-semibold text-amber-800 mb-4 text-lg">Motif Batik Khas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedProvince.batikInfo.motifs.map((motif, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-amber-100 to-orange-100 px-4 py-3 rounded-lg text-center border border-amber-200 hover:shadow-md transition-shadow duration-200"
                      >
                        <span className="text-amber-800 font-medium text-sm">{motif}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Characteristics and History */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-semibold text-amber-800 mb-3 text-lg">Karakteristik</h3>
                    <p className="text-amber-700 leading-relaxed text-sm">
                      {selectedProvince.batikInfo.characteristics}
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-amber-800 mb-3 text-lg">Sejarah</h3>
                    <p className="text-amber-700 leading-relaxed text-sm">{selectedProvince.batikInfo.history}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
