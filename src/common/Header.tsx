"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronDown, BarChart3, Send } from 'lucide-react'
import Image from 'next/image'
import logo from '../../assets/logo/logo.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { Button } from "@/ui/button"

const Header = () => {
  return (
    <motion.header 
      className="w-full bg-white border-b border-stone-200 shadow-sm" 
      initial={{ y: -50, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Image src={logo} alt="logo" width={120} height={120} />
            <div>
              <h1 className="text-xl font-bold text-stone-900">Park Baku</h1>
              <p className="text-sm text-stone-500">Send Guest Checks</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 text-stone-700 hover:text-burgundy-600 hover:bg-stone-50 transition-colors"
                >
                  <span>Navigation</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-white/95 backdrop-blur-sm border-stone-200 shadow-lg"
              >
                <DropdownMenuItem 
                  className="flex items-center space-x-2 cursor-pointer text-stone-700 hover:text-burgundy-600 hover:bg-stone-50 transition-colors"
                  onClick={() => window.location.href = '/send'}
                >
                  <Send className="h-4 w-4" />
                  <span>Send Check</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center space-x-2 cursor-pointer text-stone-700 hover:text-burgundy-600 hover:bg-stone-50 transition-colors"
                  onClick={() => window.location.href = '/popular'}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Popular Dishes</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header