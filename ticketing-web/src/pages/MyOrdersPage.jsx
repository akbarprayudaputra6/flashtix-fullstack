import { useEffect, useState } from "react";
import { TicketCheck, CreditCard, RefreshCw } from "lucide-react";
import * as orderService from "../services/order.service";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.fetchMyOrders();
      setOrders(data);
    } catch (err) {
      setFeedback({ type: "error", text: "Gagal memuat daftar pesanan." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePayNow = (snapToken) => {
    if (!window.snap || !snapToken) {
      setFeedback({
        type: "error",
        text: "Token pembayaran tidak tersedia atau script Midtrans belum siap.",
      });
      return;
    }

    setFeedback({ type: "", text: "" });

    window.snap.pay(snapToken, {
      onSuccess: () => {
        setFeedback({
          type: "success",
          text: "Pembayaran berhasil! Memperbarui status tiket...",
        });
        setTimeout(() => loadOrders(), 1500);
      },
      onPending: () => {
        setFeedback({
          type: "success",
          text: "Instruksi pembayaran dibuat. Silakan selesaikan transfer sebelum kedaluwarsa.",
        });
        loadOrders();
      },
      onError: () => {
        setFeedback({
          type: "error",
          text: "Terjadi kesalahan saat memproses pembayaran.",
        });
      },
      onClose: () => {
        loadOrders();
      },
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        Memuat tiket Anda...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TicketCheck className="w-6 h-6 text-amber-500" />
          Riwayat Tiket Saya
        </h1>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {feedback.text && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.text}
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    ORDER ID: {order.id}
                  </span>
                  {order.paymentType && (
                    <span className="text-[11px] uppercase font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {order.paymentType.replace("_", " ")}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {order.event.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {order.event.location} •{" "}
                  {new Date(order.event.eventDate).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </p>
              </div>

              <div className="sm:text-right flex flex-col sm:items-end gap-2">
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(
                    order.status,
                  )}`}
                >
                  {order.status} ({order.quantity} Tiket)
                </span>

                <p className="text-lg font-extrabold text-slate-900">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </p>

                {order.status === "PENDING" && order.snapToken && (
                  <button
                    onClick={() => handlePayNow(order.snapToken)}
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Bayar Sekarang
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
