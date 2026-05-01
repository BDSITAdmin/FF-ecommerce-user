import React, { useState } from "react";

interface OrderReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess?: () => void;
}

const OrderReturnModal: React.FC<OrderReturnModalProps> = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("reason", reason);
      if (image) formData.append("image", image);
      const { createReturnRequest } = await import("@/services/return.service");
      await createReturnRequest(formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit return request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-black mb-2">Return Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Reason</label>
            <input
              type="text"
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              placeholder="Enter reason for return"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm"
              onChange={e => setImage(e.target.files?.[0] || null)}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0065A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005183] disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderReturnModal;
