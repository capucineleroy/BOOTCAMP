"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    router.push('/');
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <button disabled={loading} className="w-full py-3 rounded-lg bg-[color:var(--color-brand-4)] text-white">{loading ? 'Loading...' : 'Login'}</button>
      </form>
      <p className="text-xs text-neutral-600 mt-4">Tip: Use emails like admin@example.com or seller@example.com to see role-based nav.</p>
    </div>
  );
}

