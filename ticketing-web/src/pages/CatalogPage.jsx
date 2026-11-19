import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Zap } from "lucide-react";
import * as eventService from "../services/event.service";
import * as orderService from "../services/order.service";
import { useAuth } from "../context/AuthContext";

export default function CatalogPage() {
  const [events, setEvents] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      const data = await eventService.fetchAllEvents();
      setEvents(data);
    } catch (err) {
      setFeedback({
        type: "error",
        text: "Gagal memuat daftar event dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleBook = async (eventId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const quantity = Number(quantities[eventId] || 1);
    setBookingId(eventId);
    setFeedback({ type: "", text: "" });

    try {
      await orderService.bookTicket({ eventId, quantity });
      setFeedback({
        type: "success",
        text: `Berhasil mengamankan ${quantity} tiket! Cek menu "Tiket Saya".`,
      });
      await loadEvents(); // Refresh kuota sisa terbaru dari PostgreSQL
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Gagal memesan tiket.",
      });
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Memuat katalog event...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full mb-2">
          <Zap className="w-3.5 h-3.5" /> Live Flash Sale
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Event & Konser Tersedia
        </h1>
        <p className="text-slate-600 mt-1">
          Stok dijamin akurat secara real-time dengan PostgreSQL Row-Level
          Locking.
        </p>
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

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          Belum ada event yang dipublikasikan. Silakan login sebagai Admin untuk
          menambahkan event.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const isSoldOut = ev.availableQuota === 0;
            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {ev.title}
                    </h2>
                    <span
                      className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                        isSoldOut
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isSoldOut
                        ? "SOLD OUT"
                        : `Sisa ${ev.availableQuota}/${ev.totalQuota}`}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {ev.description || "Tidak ada deskripsi tambahan."}
                  </p>

                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {new Date(ev.eventDate).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Maks. 5 tiket per transaksi</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">
                      Harga per tiket
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      Rp {ev.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {!isSoldOut ? (
                    <div className="flex gap-2">
                      <select
                        value={quantities[ev.id] || 1}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [ev.id]: Number(e.target.value),
                          })
                        }
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
                      >
                        {[1, 2, 3, 4, 5]
                          .filter((n) => n <= ev.availableQuota)
                          .map((num) => (
                            <option key={num} value={num}>
                              {num}x
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={() => handleBook(ev.id)}
                        disabled={bookingId === ev.id}
                        className="flex-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50 cursor-pointer"
                      >
                        {bookingId === ev.id ? "Memproses..." : "Beli Sekarang"}
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-200 text-slate-500 font-semibold py-2 rounded-lg text-sm cursor-not-allowed"
                    >
                      Kuota Habis
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
