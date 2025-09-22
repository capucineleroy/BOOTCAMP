"use client";

import AdminGuard from '@/components/AdminGuard';

export default function AdminOnlyPage() {
  return (
    <AdminGuard>
      <div className="container py-8">
        <h1 className="text-2xl font-semibold">Admin Console</h1>
        <p className="mt-3 text-sm text-neutral-600">Seuls les administrateurs peuvent voir cette page.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border rounded-xl p-5">
            <div className="font-medium">Manage Users</div>
            <div className="text-sm text-neutral-600">Crud and admin actions (example)</div>
          </div>
          <div className="border rounded-xl p-5">
            <div className="font-medium">Site Settings</div>
            <div className="text-sm text-neutral-600">Change site-wide settings</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
