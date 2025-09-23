"use client";

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import AdminGuard from '@/components/AdminGuard';
import SalesMetric from '@/components/dashboard/SalesMetric';
import RepairChart from '@/components/dashboard/RepairChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import StockAlerts from '@/components/dashboard/StockAlerts';

export default function DashboardPage() {
  const { role } = useAuth();
  const canManageProducts = role === 'seller' || role === 'admin';

  return (
    <AdminGuard>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Aperçu en temps réel de votre activité</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {canManageProducts && (
              <Link href="/dashboard/products" className="border rounded-lg border-neutral-200 p-6 mb-6 hover:bg-neutral-50 transition-colors">
                <div className="font-medium text-gray-900">Gérer les produits</div>
                <div className="text-sm text-neutral-600 mt-1">Créer, modifier et gérer le stock</div>
              </Link>
            )}

            {role === 'admin' && (
              <div className="border rounded-lg border-neutral-200 p-6 mb-6 hover:bg-neutral-50 transition-colors opacity-50">
                <div className="font-medium text-gray-600">Utilisateurs</div>
                <div className="text-sm text-neutral-600 mt-1">Voir les utilisateurs (simulation)</div>
              </div>
            )}

            {/* Placeholder cards for other actions */}
            <div className="border rounded-lg border-neutral-200 p-6 mb-6 hover:bg-neutral-50 transition-colors opacity-50">
              <div className="font-medium text-gray-600">Commandes</div>
              <div className="text-sm text-neutral-600 mt-1">Gérer les commandes</div>
            </div>

            <div className="border rounded-lg border-neutral-200 p-6 mb-6 hover:bg-neutral-50 transition-colors opacity-50">
              <div className="font-medium text-gray-600">Rapports</div>
              <div className="text-sm text-neutral-600 mt-1">Analyses détaillées</div>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="mb-8">
          <StockAlerts />
        </div>

        {/* Dashboard Metrics */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <div className="w-full">
            <SalesMetric />
          </div>

          <div className="w-full">
            <RepairChart />
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Le tableau de bord se met à jour automatiquement toutes les 30 secondes à 2 minutes selon les données.
                  Les données sont récupérées en temps réel depuis votre base de données.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

