"use client";

import { ImagePlus, RotateCcw } from "lucide-react";

type ReturnRequestModalProps = {
    isOpen: boolean;
    orderId: string | null;
    reason: string;
    image: File | null;
    submitting: boolean;
    error: string;
    success: string;
    onClose: () => void;
    onReasonChange: (value: string) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onSuccessOk: () => void;
};

export default function ReturnRequestModal({
    isOpen,
    orderId,
    reason,
    image,
    submitting,
    error,
    success,
    onClose,
    onReasonChange,
    onFileChange,
    onSubmit,
    onSuccessOk,
}: ReturnRequestModalProps) {
    if (!isOpen && !success) return null;

    const successMessage = "Your return was successfully done.";

    return (
        <>
            {isOpen && orderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-black">Return Order</h2>
                                <p className="text-xs text-black/60">
                                    Order #{orderId.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/70 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="returnReason" className="block text-sm font-semibold mb-2">
                                    Reason
                                </label>
                                <textarea
                                    id="returnReason"
                                    rows={4}
                                    value={reason}
                                    onChange={(event) => onReasonChange(event.target.value)}
                                    placeholder="Wrong product delivered"
                                    className="w-full rounded-xl border border-black/15 p-3 text-sm outline-none focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30"
                                />
                            </div>

                            <div>
                                <label htmlFor="returnImage" className="block text-sm font-semibold mb-2">
                                    Upload Image (Optional)
                                </label>
                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor="returnImage"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:border-[#0065A6]"
                                    >
                                        <ImagePlus size={16} />
                                        Choose File
                                    </label>
                                    <span className="text-sm text-black/55 truncate">
                                        {image ? image.name : "No file selected"}
                                    </span>
                                </div>
                                <input
                                    id="returnImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    className="hidden"
                                />
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <span
                                    className="inline-flex"
                                    title={success ? successMessage : undefined}
                                >
                                    <button
                                        type="submit"
                                        disabled={submitting || !!success}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#0065A6] hover:bg-[#00558d] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <RotateCcw size={16} />
                                        {submitting ? "Submitting..." : "Submit Return"}
                                    </button>
                                </span>
                            </div>
                            {success && (
                                <p className="mt-3 text-xs text-black/60">{successMessage}</p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {success && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-black">Return Submitted</h3>
                        <p className="mt-2 text-sm text-black/70">{success}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={onSuccessOk}
                                className="rounded-xl bg-[#0065A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00558d]"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
