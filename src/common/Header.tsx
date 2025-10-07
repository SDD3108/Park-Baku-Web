import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import Image from 'next/image';
import logo from '../../assets/logo/logo.png'
const Header = ()=>{
  return (
    <motion.header className="w-full bg-white border-b border-stone-200 shadow-sm" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src={logo} alt="logo" width={120} height={120} />
            <div>
              <h1 className="text-xl font-bold text-stone-900">Park Baku</h1>
              <p className="text-sm text-stone-500">Send Guest Checks</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;