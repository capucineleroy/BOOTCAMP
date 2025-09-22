"use client";

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import AdminGuard from '@/components/AdminGuard';

export default function DashboardPage() {
  const { role } = useAuth();
  const canManageProducts = role === 'seller' || role === 'admin';

  return (
    <AdminGuard>
      <div className="container py-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {canManageProducts && (
            <Link href="/dashboard/products" className="border rounded-xl p-5 hover:bg-neutral-50">
              <div className="font-medium">Manage Products</div>
              <div className="text-sm text-neutral-600">Create, update, and manage stock</div>
            </Link>
          )}
          {role === 'admin' && (
            <div className="border rounded-xl p-5 opacity-75">
              <div className="font-medium">Users</div>
              <div className="text-sm text-neutral-600">View users (mocked)</div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}

