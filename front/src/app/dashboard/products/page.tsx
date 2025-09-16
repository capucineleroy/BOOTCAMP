"use client";
import { useState } from 'react';
import { products as initial, products } from '../../../lib/data';

export default function ProductsAdmin() {
  // local mutable copy for demo-only CRUD (not persistent)
  const [list, setList] = useState([...initial]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(99);

  const add = () => {
    const id = `p-${list.length + 1}`;
    setList([{ ...list[0], id, name: name || `New Sneaker ${id}`, price, images: ['/placeholder.svg'] }, ...list]);
    setName('');
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold">Products</h1>
      <div className="mt-4 border rounded-xl p-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border rounded px-3 py-2" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} />
          <button onClick={add} className="rounded bg-black text-white px-3 py-2">Add product</button>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {list.slice(0, 20).map((p) => (
          <div key={p.id} className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-neutral-600">{p.price} €</div>
              </div>
            </div>
            <button className="text-xs text-rose-600" onClick={() => setList((prev) => prev.filter((x) => x.id !== p.id))}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

