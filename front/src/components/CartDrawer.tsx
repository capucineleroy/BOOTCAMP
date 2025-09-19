"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, close, detailed, subtotal, setQuantity, remove } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const handleCheckout = () => {
    close();
    router.push("/checkout");
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed inset-y-0 right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-b-[#E6E6E6]">
          <h2 className="text-lg font-semibold text-[#015A52]">Your Cart</h2>
          <button onClick={close} className="text-sm text-neutral-600 hover:text-neutral-900" aria-label="Close cart">
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 9.5rem)" }}>
            {detailed.length === 0 && <p className="text-sm text-neutral-600">Your cart is empty.</p>}

            {detailed.map((item) => {
              const img = item.product?.images?.[0] ?? "";
              const name = item.product?.name ?? "Product";
              const price = (item.variant?.price ?? 0) * (item.quantity ?? 0);

              return (
                <div key={item.variantId} className="flex gap-3 border rounded-lg p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={name}
                    onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{name}</div>
                        <div className="text-xs text-neutral-500">Taille {item.variant?.size ?? "-"} · {item.variant?.color ?? "-"}</div>
                      </div>
                      <div className="text-sm">{price.toFixed(0)} €</div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                        <button
                          aria-label={`Decrease quantity for ${name}`}
                          className="px-2 py-1 rounded border disabled:opacity-40"
                          onClick={() => {
                            const next = (item.quantity ?? 1) - 1;
                            if (next <= 0) remove(item.variantId);
                            else setQuantity(item.variantId, next);
                          }}
                          disabled={(item.quantity ?? 1) <= 1}
                        >
                          -
                        </button>

                        <span className="text-sm w-6 text-center">{item.quantity}</span>

                        <button
                          aria-label={`Increase quantity for ${name}`}
                      className="px-2 py-1 rounded border disabled:opacity-40"
                      onClick={() => setQuantity(item.variantId, (item.quantity ?? 1) + 1)}
                      disabled={(item.quantity ?? 1) >= (item.variant?.stock ?? Infinity)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-xs text-rose-600"
                        onClick={() => remove(item.variantId)}
                        aria-label={`Remove ${name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer / Total */}
          <div className="border-t-2 border-[#015A52] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-600">Total</span>
              <span className="text-base font-semibold">{(subtotal ?? 0).toFixed(0)} €</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={detailed.length === 0}
              className="w-full py-3 rounded-lg bg-[#015A52] text-white hover:opacity-95 disabled:opacity-50"
            >
              Checkout
            </button>

            {/* small link backup (accessible) */}
            <div className="mt-2 text-center">
              <Link href="/shop" onClick={close} className="text-sm text-neutral-600 hover:underline">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
