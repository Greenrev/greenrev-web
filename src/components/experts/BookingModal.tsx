import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanicId: string;
  mechanicName: string;
}

export default function BookingModal({ isOpen, onClose, mechanicId, mechanicName }: BookingModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    issueDescription: "",
    requestedDate: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await apiRequest("/api/v1/bookings", {
        method: "POST",
        body: JSON.stringify({
          mechanicId,
          vehicleDetails: {
            make: formData.make,
            model: formData.model,
            year: formData.year,
          },
          issueDescription: formData.issueDescription,
          requestedDate: formData.requestedDate,
        }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ make: "", model: "", year: "", issueDescription: "", requestedDate: "" });
        }, 3000);
      } else {
        setError(res.error?.message || "Failed to submit booking");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8">
            <h2 className="text-2xl font-display text-white mb-2">Book Service</h2>
            <p className="text-subtle text-sm mb-8">
              Request a specialized service appointment with <span className="text-accent">{mechanicName}</span>.
            </p>

            {!user ? (
              <div className="text-center py-8">
                <p className="text-white/80 mb-6">You need to be logged in to book an expert.</p>
                <button 
                  onClick={() => router.push("/login")}
                  className="bg-accent text-black font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl hover:bg-white transition-colors"
                >
                  Log In or Sign Up
                </button>
              </div>
            ) : success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Request Sent!</h3>
                <p className="text-subtle text-sm">
                  {mechanicName} will review your request and you will be notified soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white uppercase tracking-widest">Make</label>
                    <input
                      required
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      placeholder="e.g. Toyota"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white uppercase tracking-widest">Model</label>
                    <input
                      required
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g. Camry"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white uppercase tracking-widest">Year</label>
                    <input
                      required
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="e.g. 2018"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white uppercase tracking-widest">Preferred Date</label>
                    <input
                      required
                      type="datetime-local"
                      name="requestedDate"
                      value={formData.requestedDate}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white uppercase tracking-widest">Issue Description</label>
                  <textarea
                    required
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the problem or service needed..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
