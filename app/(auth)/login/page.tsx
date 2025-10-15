"use client"
import React, { useState } from 'react';
import { motion, easeInOut } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthComponent/AuthComponent';
import { useRouter } from 'next/navigation';
import logo from '../../../assets/logo/logo.jpg'
import Image from 'next/image';

const PREDEFINED_ACCOUNTS = [
  { username: 'admin', password: '3108', role: 'admin', name: 'Администратор' },
  { username: 'asem', password: '1234', role: 'accountant', name: 'Главный бухгалтер' },
  { username: 'cashier', password: '1111', role: 'cashier', name: 'Старший кассир' }
]

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent)=>{
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const account = PREDEFINED_ACCOUNTS.find((acc) => acc.username == username && acc.password == password)
    if(account){
      login(account)
      toast.success(`Добро пожаловать, ${account.name}!`)
      router.push('/send')
    }
    else{
      toast.error('Неверное имя пользователя или пароль')
    }
    setIsLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }
  const pomegranateVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: easeInOut
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(127,29,29,0.02)_25%,rgba(127,29,29,0.02)_50%,transparent_50%,transparent_75%,rgba(127,29,29,0.02)_75%)] bg-[length:20px_20px]"></div>
      <div className="absolute top-10 left-10 opacity-5">
        <motion.div variants={pomegranateVariants} initial="initial" animate="animate">
        </motion.div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-5">
        <motion.div variants={pomegranateVariants} initial="initial" animate="animate" transition={{ delay: 2 }}>
        </motion.div>
      </div>

      <motion.div className="w-full max-w-md z-10" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Card className="bg-white border-stone-200 shadow-xl">
            <CardHeader className="text-center pb-6 pt-8">
              <motion.div className="mx-auto mb-4" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Image src={logo} alt='logo' width={120} height={120} className='rounded-xl' />
              </motion.div>
              <CardDescription className="text-stone-600 mt-2">
                Система управления рестораном
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Label htmlFor="username" className="text-stone-700 flex items-center gap-2 mb-3 font-medium">
                    <User className="h-4 w-4 text-burgundy-600" />
                    Имя пользователя
                  </Label>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Input id="username" type="text" value={username} onChange={(e)=>{setUsername(e.target.value)}} placeholder="Введите имя пользователя" className="bg-white border-stone-300 focus:border-burgundy-600 focus:ring-burgundy-600/20 transition-all duration-300" required/>
                  </motion.div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Label htmlFor="password" className="text-stone-700 flex items-center gap-2 mb-3 font-medium">
                    <Lock className="h-4 w-4 text-burgundy-600" />
                    Пароль
                  </Label>
                  <motion.div className="relative" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="Введите пароль" className="bg-white border-stone-300 focus:border-burgundy-600 focus:ring-burgundy-600/20 pr-10 transition-all duration-300" required/>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-stone-50" onClick={()=>{setShowPassword(!showPassword)}}>
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-stone-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-stone-500" />
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button type="submit" disabled={isLoading} className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"/>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </motion.div>
              </form>
              <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <p className="text-sm text-stone-500">Безопасный доступ к системе управления рестораном</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
