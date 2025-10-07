"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { TrendingUp, Star, BarChart3, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { Skeleton } from '@/ui/skeleton';
import { toast } from 'sonner';
import Header from '@/common/Header';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

interface PopularDish {
  rank: number;
  name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
}

const PopularProductPage = () => {
  const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');

  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
      'Authorization': 'Bearer 9014bf1230364c329d25186c13b44775'
    }
  });

  useEffect(() => {
    fetchPopularDishes();
  }, [timeRange]);

  const fetchPopularDishes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/popular-dishes/');
      const sortedData = response.data.sort((a: PopularDish, b: PopularDish) => 
        b.total_orders - a.total_orders
      )
      setPopularDishes(sortedData);
    }
    catch(error){
      console.error('Ошибка при загрузке популярных блюд:', error);
      toast.error('Не удалось загрузить популярные блюда');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Рейтинг', 'Название блюда', 'Всего заказов', 'Количество порций', 'Общая выручка (тг)'];
    const csvData = popularDishes.map(dish => [
      dish.rank,
      `"${dish.name}"`,
      dish.total_orders,
      dish.total_quantity,
      dish.total_revenue
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `популярные-блюда-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Данные экспортированы в CSV');
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-amber-500';
      case 2: return 'text-stone-500';
      case 3: return 'text-amber-700';
      default: return 'text-stone-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'accountant']}>
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="w-full max-w-6xl mx-auto shadow-lg border-stone-200">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-burgundy-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-2xl font-bold text-stone-900">
                      Популярные блюда
                    </CardTitle>
                    <CardDescription className="text-stone-600">
                      Самые заказываемые блюда и статистика по выручке
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Фильтры по времени */}
                  <div className="flex bg-stone-100 rounded-lg p-1">
                    {[
                      { value: 'all', label: 'За всё время' },
                      { value: 'month', label: 'Этот месяц' },
                      { value: 'week', label: 'Эта неделя' }
                    ].map((range) => (
                      <Button
                        key={range.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => setTimeRange(range.value as any)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          timeRange === range.value
                            ? 'bg-burgundy-600 text-white shadow-sm'
                            : 'text-stone-600 hover:text-burgundy-600'
                        }`}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    size="sm"
                    className="border-stone-300 text-stone-700 hover:bg-stone-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Статистические карточки */}
              {!isLoading && popularDishes.length > 0 && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-stone-50 border-stone-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-600">Всего блюд</p>
                          <p className="text-2xl font-bold text-stone-900">{popularDishes.length}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-burgundy-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-stone-50 border-stone-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-600">Самое популярное</p>
                          <p className="text-lg font-bold text-stone-900 truncate max-w-[120px]">
                            {popularDishes[0]?.name}
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-amber-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-stone-50 border-stone-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-stone-600">Общая выручка</p>
                          <p className="text-2xl font-bold text-stone-900">
                            {popularDishes.reduce((sum, dish) => sum + dish.total_revenue, 0).toLocaleString()} тг
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Таблица */}
              <Card className="border-stone-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-stone-100 hover:bg-stone-100">
                      <TableHead className="w-20 text-center font-semibold text-stone-900">Рейтинг</TableHead>
                      <TableHead className="font-semibold text-stone-900">Название блюда</TableHead>
                      <TableHead className="text-center font-semibold text-stone-900">Всего заказов</TableHead>
                      <TableHead className="text-center font-semibold text-stone-900">Количество</TableHead>
                      <TableHead className="text-right font-semibold text-stone-900">Выручка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-6 w-6 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : popularDishes.length > 0 ? (
                      popularDishes.map((dish, index) => (
                        <motion.tr
                          key={dish.rank}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                        >
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center font-bold ${getRankColor(dish.rank)}`}>
                              {getRankIcon(dish.rank)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                dish.rank === 1 ? 'bg-amber-500' :
                                dish.rank === 2 ? 'bg-stone-400' :
                                dish.rank === 3 ? 'bg-amber-700' : 'bg-stone-300'
                              }`} />
                              <span className="font-medium text-stone-900">{dish.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-stone-700">{dish.total_orders}</span>
                            <span className="text-sm text-stone-500 ml-1">заказов</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-burgundy-600">{dish.total_quantity}</span>
                            <span className="text-sm text-stone-500 ml-1">шт.</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="font-bold text-stone-900">
                                {dish.total_revenue.toLocaleString()} тг
                              </span>
                              {dish.rank <= 3 && (
                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <BarChart3 className="h-12 w-12 text-stone-300" />
                            <p className="text-stone-500">Данные отсутствуют</p>
                            <Button 
                              onClick={fetchPopularDishes}
                              variant="outline"
                              size="sm"
                              className="mt-2 border-stone-300"
                            >
                              Повторить попытку
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>

              {/* Сводка */}
              {!isLoading && popularDishes.length > 0 && (
                <motion.div 
                  className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-stone-600">Всего блюд</p>
                      <p className="font-semibold text-stone-900">{popularDishes.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-stone-600">Всего заказов</p>
                      <p className="font-semibold text-stone-900">
                        {popularDishes.reduce((sum, dish) => sum + dish.total_orders, 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-stone-600">Всего продано</p>
                      <p className="font-semibold text-stone-900">
                        {popularDishes.reduce((sum, dish) => sum + dish.total_quantity, 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-stone-600">Общая выручка</p>
                      <p className="font-semibold text-stone-900">
                        {popularDishes.reduce((sum, dish) => sum + dish.total_revenue, 0).toLocaleString()} тг
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default PopularProductPage
