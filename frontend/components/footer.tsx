"use client"
import { Instagram, Twitter, Phone, Mail, MapPin, Heart } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-amber-800 to-red-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg bg-white p-1">
                <Image
                  src="/images/batikgram-logo.png"
                  alt="BatikGram Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">BatikGram</h3>
                <p className="text-amber-100 text-sm">Experience Batik Culture</p>
              </div>
            </div>
            <p className="text-amber-100 leading-relaxed">
              Melestarikan warisan budaya batik Indonesia melalui teknologi modern dan inovasi digital untuk generasi
              masa depan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Navigasi Cepat</h4>
            <div className="space-y-2">
              <a href="/" className="block text-amber-100 hover:text-white transition-colors duration-200">
                Beranda
              </a>
              <a href="/camera" className="block text-amber-100 hover:text-white transition-colors duration-200">
                Kamera AR
              </a>
              <a href="/chat" className="block text-amber-100 hover:text-white transition-colors duration-200">
                Chat Assistant
              </a>
              <a href="/map" className="block text-amber-100 hover:text-white transition-colors duration-200">
                Peta Indonesia
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Hubungi Kami</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-200" />
                <span className="text-amber-100">+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-200" />
                <span className="text-amber-100">info@batikgram.id</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-amber-200" />
                <span className="text-amber-100">Yogyakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Ikuti Kami</h4>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/batikgram"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/batikgram"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="tel:+6281234567890"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-amber-100">
              <span>© 2024 BatikGram. Semua hak cipta dilindungi.</span>
            </div>

            <div className="flex items-center space-x-2 text-amber-100">
              <span>Dibuat dengan</span>
              <Heart className="w-4 h-4 text-red-300 fill-current" />
              <span>untuk melestarikan budaya Indonesia</span>
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 mt-4 text-sm text-amber-200">
            <a href="#" className="hover:text-white transition-colors duration-200">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Syarat & Ketentuan
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              FAQ
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Bantuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
