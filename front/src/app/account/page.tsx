"use client";
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AccountPage() {
  const { user, logout } = useAuth();
  if (!user) return (
    <div className="container py-10">
      <p>Please <Link className="underline" href="/login">login</Link>.</p>
    </div>
  );
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="mt-4 border rounded-xl p-4 max-w-md">
        <div className="text-sm">Name: {user.name}</div>
        <div className="text-sm">Email: {user.email}</div>
        <div className="text-sm">Role: {user.role}</div>
        <button onClick={logout} className="mt-4 rounded bg-black text-white px-4 py-2">Logout</button>
      </div>
    </div>
  );
}

