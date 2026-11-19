import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import * as eventService from "../services/event.service";

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    price: 100000,
    totalQuota: 10,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadEvents = async () => {
    const data = await eventService.fetchAllEvents();
    setEvents(data);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await eventService.createEvent({
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
        price: Number(form.price),
        totalQuota: Number(form.totalQuota),
      });
      setMessage("Event baru berhasil ditambahkan!");
      setForm({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        price: 100000,
        totalQuota: 10,
      });
      await loadEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Gagal membuat event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus event ini?")) return;
    await eventService.deleteEvent(id);
    await loadEvents();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
      {/* Form Buat Event */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-500" />
          Buat Event Flash Sale
        </h2>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3 text-sm">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Judul Event
            </label>
            <input
              type="text"
              required
              minLength={5}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Konser Rock Nusantara"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Stadion Kridosono, Yogyakarta"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tanggal & Waktu
            </label>
            <input
              type="datetime-local"
              required
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Total Kuota
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.totalQuota}
                onChange={(e) =>
                  setForm({ ...form, totalQuota: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Deskripsi
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer"
          >
            {submitting ? "Menyimpan..." : "Publikasikan Event"}
          </button>
        </form>
      </div>

      {/* Daftar Event Kelolaan */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Daftar Event Aktif
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Harga</th>
                <th className="py-3 px-4">Kuota Sisa</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {ev.title}
                  </td>
                  <td className="py-3 px-4">
                    Rp {ev.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{ev.availableQuota}</span> /{" "}
                    {ev.totalQuota}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="Hapus Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
