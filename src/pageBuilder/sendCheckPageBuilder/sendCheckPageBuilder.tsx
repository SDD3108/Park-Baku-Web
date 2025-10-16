"use client"
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Check, Upload, ChevronsUpDown, Users, FileSpreadsheet, X, Receipt } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/ui/command';
import { Skeleton } from '@/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Header from '@/common/Header';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

const api = axios.create({
  // baseURL: 'https://park-baku-1.onrender.com/api',
  baseURL: 'https://82.115.49.250/api',
  headers: {
    'Authorization': 'Bearer 9014bf1230364c329d25186c13b44775'
  }
})

interface Guest {
  value: string;
  label: string;
}
interface Dish {
  dish_name: string;
  quantity: number;
  price: number;
  full_amount: number;
  final_amount: number;
  waiter: string;
  dish_code: string;
}
interface ParsedCheck {
  dishes: Dish[];
  total_amount: number;
  total_final_amount: number;
  order_number: string;
  table_number: string;
  guest_number: string;
}

const SendCheckPageBuilder = () => {
  const [open, setOpen] = useState(false)
  const [guestId, setGuestId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [parsedCheck, setParsedCheck] = useState<ParsedCheck | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  useEffect(()=>{
    const fetchGuests = async()=>{
      try{
        setGuestsLoading(true)
        const response = await api.get('/customers/')
        const guestData = response.data.map((guest:any)=>({
          value: guest.customer_id,
          label:`Гость ${guest.customer_id}`,
        }))
        setGuests(guestData)
      }
      catch(error){
        console.error('Ошибка при получении списка гостей',error);
        toast.error('Не удалось загрузить гостей')
      }
      finally{
        setGuestsLoading(false)
      }
    }
    fetchGuests()
  },[])

  const handleDragOver = useCallback((e: React.DragEvent)=>{
    e.preventDefault()
    setIsDragOver(true)
  },[])
  const handleDragLeave = useCallback((e: React.DragEvent)=>{
    e.preventDefault()
    setIsDragOver(false)
  },[])
  const handleDrop = useCallback((e: React.DragEvent)=>{
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = e.dataTransfer.files
    if(droppedFiles.length > 0){
      const droppedFile = droppedFiles[0]
      handleFileValidation(droppedFile)
    }
  },[])
  const handleFileValidation = (selectedFile:File)=> {
    const validExtensions = ['.xlsx','.xls','.csv']
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'))
    
    if(validExtensions.includes(fileExtension)){
      setFile(selectedFile)
      parseExcelFile(selectedFile)
    }
    else{
      toast.error('Пожалуйста, выберите корректный Excel-файл (.xlsx, .xls, .csv)')
      setFile(null)
    }
  }
  const handleFileChange = (event:React.ChangeEvent<HTMLInputElement>)=>{
    const selectedFile = event.target.files?.[0]
    if(selectedFile){
      handleFileValidation(selectedFile)
    }
  }
  const parseExcelFile = (file:File)=>{
    const reader = new FileReader()
    reader.onload = (e)=>{
      try{
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        const parsedData = parseExcelData(jsonData)
        setParsedCheck(parsedData)
        toast.success(`Обработано ${parsedData.dishes.length} позиций из чека`)
      }
      catch(error){
        console.error('Ошибка при разборе Excel-файла', error);
        toast.error('Ошибка при разборе Excel-файла')
      }
    }
    reader.readAsArrayBuffer(file)
  }
  const parseExcelData = (data:any[]): ParsedCheck =>{
    const dishes: Dish[] = []
    let total_amount = 0
    let total_final_amount = 0
    let order_number = ''
    let table_number = ''
    let guest_number = ''
    let dataStartIndex = 0

    for(let i = 0; i < data.length; i++){
      if(data[i] && data[i][0] == 'Официант'){
        dataStartIndex = i + 1
        break
      }
    }
    for(let i = dataStartIndex; i < data.length; i++){
      const row = data[i]
      if(!row || !row[0] || row[0] == ''){
        continue
      }
      const waiter = String(row[0] || '')
      const dish_code = String(row[1] || '')
      const dish_name = String(row[2] || '')
      const quantity = Number(row[10] || 0)
      const price = Number(row[11] || 0)
      const full_amount = Number(row[13] || 0)
      const final_amount = Number(row[15] || 0)

      if(!order_number && row[8]){
        order_number = String(row[8])
      }
      if(!table_number && row[9]){
        table_number = String(row[9])
      }
      if(!guest_number && row[18]){
        guest_number = String(row[18])
      }
      if(dish_name && quantity > 0 && full_amount > 0){
        dishes.push({
          dish_name,
          quantity,
          price,
          full_amount,
          final_amount,
          waiter,
          dish_code
        })
        total_amount += full_amount
        total_final_amount += final_amount
      }
    }
    return{
      dishes,
      total_amount,
      total_final_amount,
      order_number,
      table_number,
      guest_number
    }
  }
  const removeFile = ()=>{
    setFile(null)
    setParsedCheck(null)
    toast.info('Файл удалён')
  }
  const handleSubmit = async()=>{
    if(!guestId || !file || !parsedCheck){
      toast.error('Выберите гостя и загрузите корректный Excel-файл')
      return
    }
    setIsLoading(true)
    try {
      const payload = {
        customer_id: guestId,
        dishes: parsedCheck.dishes.map(dish => ({
          dish_name: dish.dish_name,
          quantity: dish.quantity,
          price: dish.final_amount / dish.quantity,
          order_number: parsedCheck.order_number,
          table_number: parsedCheck.table_number
        }))
      }
      await api.post('/orders/with-dishes/',payload)
      setIsSuccess(true)
      toast.success(`Успешно отправлено ${parsedCheck.dishes.length} позиций из чека!`)
      setTimeout(()=>{
        setIsSuccess(false)
        setGuestId('')
        setFile(null)
        setParsedCheck(null)
      },3000)
    }
    catch(error:any){
      console.error('Ошибка при отправке чека',error);
      if(error.response?.data?.error){
        toast.error(`Ошибка: ${error.response.data.error}`)
      }
      else{
        toast.error('Ошибка при отправке чека. Попробуйте снова.')
      }
    }
    finally{
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="w-full max-w-4xl mx-auto shadow-lg border-stone-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-stone-900">Отправка чека гостя</CardTitle>
              <CardDescription className="text-stone-600">Выберите гостя и загрузите его Excel-файл с чеком</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="guest-search" className="text-stone-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Выберите ID гостя
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between border-stone-300 bg-white">
                      {guestId ? guests.find((guest) => guest.value === guestId)?.label : "Выберите гостя..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Поиск гостя..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>{guestsLoading ? "Загрузка списка гостей..." : "Гость не найден."}</CommandEmpty>
                        <CommandGroup>
                          {guestsLoading ? (
                            Array.from({ length: 3 }).map((_,index)=>(
                              <div key={index} className="flex items-center space-x-2 px-2 py-1.5">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            ))
                          ) : (
                            guests.map((guest,index)=>(
                              <CommandItem key={index} value={guest.value}
                                onSelect={(currentValue)=>{
                                  setGuestId(currentValue == guestId ? "" : currentValue)
                                  setOpen(false)
                                  toast.success(`Гость ${currentValue} выбран`)
                                }}
                              >
                                <Check className={cn( "mr-2 h-4 w-4", guestId == guest.value ? "opacity-100" : "opacity-0")}/>
                                {guest.label}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <Label className="text-stone-700 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Загрузите Excel-файл с чеком
                </Label>
                <motion.div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragOver ? "border-burgundy-600 bg-burgundy-50" : "border-stone-300 bg-stone-100 hover:bg-stone-200"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden"/>
                  {file ? (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                      <FileSpreadsheet className="h-12 w-12 text-burgundy-600 mb-2" />
                      <p className="text-sm font-medium text-stone-900 mb-1">{file.name}</p>
                      <p className="text-xs text-stone-500 mb-3">{(file.size / 1024 / 1024).toFixed(2)} МБ</p>
                      <Button variant="outline" size="sm"
                        onClick={(e)=>{
                          e.stopPropagation()
                          removeFile()
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Удалить файл
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FileSpreadsheet className="h-12 w-12 text-stone-400 mb-3" />
                      <p className="text-sm font-medium text-stone-900 mb-1">Перетащите Excel-файл сюда</p>
                      <p className="text-xs text-stone-500 mb-3">или нажмите, чтобы выбрать файл</p>
                      <p className="text-xs text-stone-400">Поддерживаются файлы .xlsx, .xls, .csv</p>
                    </div>
                  )}
                </motion.div>

                <p className="text-sm text-stone-500 text-center">Принимаются только Excel-файлы, содержащие данные чека гостя</p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!guestId || !file || isLoading}
                className={cn(
                  "w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-medium py-3 px-4 rounded-md transition-colors",
                  (isLoading || isSuccess) && "opacity-70"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Отправка чека...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Чек успешно отправлен!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Отправить чек
                  </div>
                )}
              </Button>

              {parsedCheck && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                  <Card className="bg-stone-50 border-stone-200">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium text-burgundy-600 flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Предпросмотр обработанного чека
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white rounded-lg border">
                        <div>
                          <p className="text-xs text-stone-500">Номер заказа</p>
                          <p className="text-sm font-medium">{parsedCheck.order_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">Стол</p>
                          <p className="text-sm font-medium">{parsedCheck.table_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">Гость</p>
                          <p className="text-sm font-medium">{parsedCheck.guest_number}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {parsedCheck.dishes.map((dish, index) => (
                          <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border text-sm">
                            <div className="col-span-6">
                              <p className="font-medium text-stone-900">{dish.dish_name}</p>
                              <p className="text-xs text-stone-500">{dish.waiter} • {dish.dish_code}</p>
                            </div>
                            <div className="col-span-2 text-center">
                              <p className="text-stone-600">Кол-во</p>
                              <p className="font-medium">{dish.quantity}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-stone-600">Цена</p>
                              <p className="font-medium">{dish.price} тг</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-stone-600">Сумма</p>
                              <p className="font-medium text-burgundy-600">{dish.final_amount} тг</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-200">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-600">Итоговая сумма:</span>
                          <span className="text-lg font-bold text-burgundy-600">{parsedCheck.total_final_amount} тг</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default SendCheckPageBuilder
