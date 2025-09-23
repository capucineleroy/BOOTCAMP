"use client";

import { useState, useEffect } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { getSalesStats } from '@/lib/dashboardApi';
import type { SalesStats } from '@/lib/types';

interface SalesMetricProps {
  refreshInterval?: number; // in milliseconds
}

export default function SalesMetric({ refreshInterval = 30000 }: SalesMetricProps) {
  const [salesData, setSalesData] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async () => {
    try {
      setError(null);
      const data = await getSalesStats();
      setSalesData(data);
    } catch (err) {
      setError('Erreur lors du chargement des données de vente');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();

    // Set up auto-refresh
    const interval = setInterval(fetchSalesData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateOrdersPerDay = (totalOrders: number) => {
    // Pour l'instant, on utilise une estimation basée sur 30 jours d'activité
    // Dans un vrai scénario, on calculerait à partir de la date de la première commande
    const estimatedDays = 30;
    const ordersPerDay = totalOrders / estimatedDays;
    return ordersPerDay < 1 ? ordersPerDay.toFixed(1) : Math.round(ordersPerDay).toString();
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <FiTrendingUp className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Ventes totales</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg border-neutral-200 p-6 mb-6 transition-colors hover:shadow-md transition-shadow w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiTrendingUp className="h-6 w-6 text-green-600 mr-3" />
          <h3 className="font-semibold text-gray-900">Ventes totales</h3>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Temps réel
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {salesData.totalSales.toLocaleString('fr-FR')}
          </div>
          <div className="text-sm text-gray-600">Commandes totales</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(salesData.totalRevenue)}
            </div>
            <div className="text-xs text-gray-600">Chiffre d'affaires</div>
          </div>

          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(salesData.averageOrderValue)}
            </div>
            <div className="text-xs text-gray-600">Panier moyen</div>
          </div>

          <div>
            <div className="text-lg font-semibold text-gray-900">
              {calculateOrdersPerDay(salesData.totalSales)}
            </div>
            <div className="text-xs text-gray-600">Commandes/jour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
