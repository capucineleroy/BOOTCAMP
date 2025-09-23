"use client";

import { useState, useEffect } from 'react';
import { FiTool } from 'react-icons/fi';
import { getRepairStats } from '@/lib/dashboardApi';
import type { RepairStats } from '@/lib/types';

interface RepairChartProps {
  refreshInterval?: number;
}

export default function RepairChart({ refreshInterval = 60000 }: RepairChartProps) {
  const [repairData, setRepairData] = useState<RepairStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepairData = async () => {
    try {
      setError(null);
      const data = await getRepairStats();
      setRepairData(data);
    } catch (err) {
      setError('Erreur lors du chargement des données de réparation');
      console.error('Error fetching repair data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairData();

    const interval = setInterval(fetchRepairData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'inProgress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'inProgress': return 'En cours';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <FiTool className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Demandes de réparation</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!repairData) {
    return null;
  }

  const maxValue = Math.max(
    repairData.pendingRequests,
    repairData.inProgressRequests,
    repairData.completedRequests,
    1 // Minimum value to avoid division by zero
  );

  return (
    <div className="bg-white border rounded-lg border-neutral-200 p-6 mb-6 transition-colors hover:shadow-md transition-shadow w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiTool className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="font-semibold text-gray-900">Demandes de réparation</h3>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Temps réel
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-700">
              {repairData.pendingRequests}
            </div>
            <div className="text-xs text-yellow-600">En attente</div>
          </div>

          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-700">
              {repairData.inProgressRequests}
            </div>
            <div className="text-xs text-blue-600">En cours</div>
          </div>

          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-700">
              {repairData.completedRequests}
            </div>
            <div className="text-xs text-green-600">Terminé</div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Répartition par statut</h4>

          <div className="space-y-2">
            {['pending', 'inProgress', 'completed'].map((status) => {
              const count = repairData[status + 'Requests' as keyof RepairStats] as number;
              const percentage = (count / maxValue) * 100;

              return (
                <div key={status} className="flex items-center space-x-3">
                  <div className="w-16 sm:w-20 text-xs text-gray-600 capitalize">
                    {getStatusLabel(status)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getStatusColor(status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 sm:w-12 text-xs text-gray-600 text-right">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {repairData.totalRequests}
            </div>
            <div className="text-sm text-gray-600">Total demandes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
