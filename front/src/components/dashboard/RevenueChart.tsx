"use client";

import { useState, useEffect } from 'react';
import { FiDollarSign } from 'react-icons/fi';
import { getRevenueData } from '@/lib/dashboardApi';
import type { RevenueData } from '@/lib/types';

interface RevenueChartProps {
  refreshInterval?: number;
}

export default function RevenueChart({ refreshInterval = 60000 }: RevenueChartProps) {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    try {
      setError(null);
      const data = await getRevenueData();
      setRevenueData(data);
    } catch (err) {
      setError('Erreur lors du chargement des données de chiffre d\'affaires');
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();

    const interval = setInterval(fetchRevenueData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  };

  const formatWeekDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <FiDollarSign className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Chiffre d'affaires</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return null;
  }

  const { weekly, daily } = revenueData;

  // Use daily data if available, otherwise use weekly
  const chartData = daily.length > 0 ? daily : weekly.map(w => ({
    date: w.week,
    revenue: w.revenue,
    orders: w.orders
  }));

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="bg-white border rounded-lg border-neutral-200 p-6 mb-6 transition-colors hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiDollarSign className="h-6 w-6 text-green-600 mr-3" />
          <h3 className="font-semibold text-gray-900">Chiffre d'affaires</h3>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Temps réel
        </div>
      </div>

      <div className="space-y-4">
        {/* Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {daily.length > 0 ? '7 derniers jours' : '8 dernières semaines'}
          </h4>

          <div className="space-y-2">
            {chartData.slice(-7).map((data, index) => {
              const percentage = (data.revenue / maxRevenue) * 100;
              const isPeakDay = data.revenue === Math.max(...chartData.map(d => d.revenue));

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-600">
                    {daily.length > 0 ? formatDate(data.date) : formatWeekDate(data.date)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPeakDay ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-xs text-gray-600 text-right">
                    {formatCurrency(data.revenue)}
                  </div>
                  <div className="w-8 text-xs text-gray-500 text-right">
                    {data.orders}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.revenue, 0))}
            </div>
            <div className="text-xs text-gray-600">Total période</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(chartData.reduce((sum, d) => sum + d.orders, 0) / chartData.length)}
            </div>
            <div className="text-xs text-gray-600">Commandes/jour</div>
          </div>
        </div>

        {/* Peak day indicator */}
        {chartData.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-gray-500">
              📈 Pic de vente: {daily.length > 0 ? formatDate(chartData.reduce((max, d) => d.revenue > max.revenue ? d : max, chartData[0]).date) : formatWeekDate(chartData.reduce((max, d) => d.revenue > max.revenue ? d : max, chartData[0]).date)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
