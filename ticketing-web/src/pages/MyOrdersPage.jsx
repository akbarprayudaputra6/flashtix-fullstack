import { useEffect, useState } from "react";
import { TicketCheck } from "lucide-react";
import * as orderService from "../services/order.service";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Memuat tiket Anda...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <TicketCheck className="w-6 h-6 text-amber-500" />
        Riwayat Tiket Saya
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
          Anda belum memiliki tiket yang dipesan.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="text-xs font-mono text-slate-400">
                  ORDER ID: {order.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {order.event.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {order.event.location} •{" "}
                  {new Date(order.event.eventDate).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full mb-1">
                  {order.status} ({order.quantity} Tiket)
                </span>
                <p className="text-lg font-extrabold text-slate-900">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
