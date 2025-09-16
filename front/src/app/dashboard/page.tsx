"use client";
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { role } = useAuth();
  const canManageProducts = role === 'seller' || role === 'admin';

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {!canManageProducts && (
        <p className="mt-2 text-sm text-neutral-600">You need seller or admin role to manage products.</p>
      )}
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
  );
}

