import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/ui/button';
import { FileText, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = ()=>{
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
            <div className="w-10 h-10 bg-burgundy-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
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