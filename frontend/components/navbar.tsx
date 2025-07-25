"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Camera, Home, MessageCircle, Map } from "lucide-react"
import Image from "next/image"

const navItems = [
  {
    name: "Beranda",
    href: "/",
    icon: Home,
  },
  {
    name: "Kamera AR",
    href: "/camera",
    icon: Camera,
  },
  {
    name: "Chat Assistant",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Peta Indonesia",
    href: "/map",
    icon: Map,
  },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleNavigation("/")}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
              <Image
                src="/images/batikgram-logo.png"
                alt="BatikGram Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-red-800 bg-clip-text text-transparent">
                BatikGram
              </h1>
              <p className="text-xs text-amber-600 -mt-1">Experience Batik Culture</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 shadow-md"
                      : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Auth Button */}
          <div className="hidden md:block relative">
            <Button
              onClick={() => handleNavigation("/camera")}
              className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Camera className="w-4 h-4 mr-2" />
              Coba Sekarang
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-amber-200 bg-white/95 backdrop-blur-md">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 shadow-md"
                        : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                )
              })}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-amber-200 space-y-2">
                <Button
                  onClick={() => handleNavigation("/camera")}
                  className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold py-3 shadow-lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Coba Sekarang
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
