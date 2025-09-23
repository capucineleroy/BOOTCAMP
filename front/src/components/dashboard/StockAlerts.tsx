"use client";

import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { getStockAlerts } from '@/lib/dashboardApi';
import type { StockAlert } from '@/lib/types';

interface StockAlertsProps {
  refreshInterval?: number;
}

export default function StockAlerts({ refreshInterval = 120000 }: StockAlertsProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchStockAlerts = async () => {
    try {
      setError(null);
      const data = await getStockAlerts();
      setAlerts(data);
    } catch (err) {
      setError('Erreur lors du chargement des alertes de stock');
      console.error('Error fetching stock alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAlerts();

    const interval = setInterval(fetchStockAlerts, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const criticalAlerts = alerts.filter(alert => alert.alertLevel === 'critical');
  const lowAlerts = alerts.filter(alert => alert.alertLevel === 'low');

  // Determine which alerts to show
  const alertsToShow = showAll ? alerts : alerts.slice(0, 10);
  const hasMoreAlerts = alerts.length > 10;

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <FiAlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Alertes Stock</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg border-neutral-200 p-6 mb-6 transition-colors hover:shadow-md transition-shadow w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiPackage className="h-6 w-6 text-orange-600 mr-3" />
          <h3 className="font-semibold text-gray-900">Alertes Stock</h3>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Temps réel
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">
              {criticalAlerts.length}
            </div>
            <div className="text-sm text-red-600">Critique (≤2)</div>
          </div>

          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">
              {lowAlerts.length}
            </div>
            <div className="text-sm text-yellow-600">Faible (≤5)</div>
          </div>
        </div>

        {/* Alerts list */}
        {alerts.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Produits nécessitant une attention</h4>
              {hasMoreAlerts && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {showAll ? 'Voir moins' : `Voir tout (${alerts.length})`}
                </button>
              )}
            </div>

            <div className={`space-y-2 ${showAll ? 'max-h-96 overflow-y-auto' : 'max-h-48 overflow-y-auto'}`}>
              {alertsToShow.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.alertLevel === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {alert.productName}
                        </h4>
                        {alert.alertLevel === 'critical' && (
                          <FiAlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {alert.variantName}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          alert.alertLevel === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Stock: {alert.currentStock}
                        </span>
                        <span className="text-xs text-gray-500">
                          Réassort: {alert.suggestedReorder}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiPackage className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Tous les stocks sont suffisants</p>
            <p className="text-gray-400 text-xs">Aucune alerte à signaler</p>
          </div>
        )}

        {/* Total products with low stock */}
        {alerts.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">
                {showAll
                  ? `${alerts.length} produit(s) nécessitent une attention`
                  : `${alertsToShow.length} produit(s) affiché(s) sur ${alerts.length} total`
                }
              </div>
              <div className="text-xs text-gray-600">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
