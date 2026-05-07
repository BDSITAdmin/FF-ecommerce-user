"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ArrowLeft, ChevronRight, Package, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cancelOrder, getOrders } from "@/services/order.service";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatShortUuid } from "@/utils/formatShortUuid";

type RootState = {
    user: { user: unknown };
};

const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-[#0065A6]",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    paid: "bg-emerald-100 text-emerald-700",
};

export default function OrdersPage() {
    const user = useSelector((state: RootState) => state.user.user);

    useRequireAuth();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [confirmOrderId, setConfirmOrderId] = useState<string>("");
    const [cancellingId, setCancellingId] = useState<string>("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getOrders({ page, limit });
                const payload = res?.data?.data ?? res?.data ?? {};

                const rows =
                    payload?.orders ??
                    res?.data?.orders ??
                    payload?.docs ??
                    payload?.items ??
                    [];

                setOrders(Array.isArray(rows) ? rows : []);

                const resolvedTotalPages =
                    Number(payload?.totalPages) ||
                    Number(res?.data?.totalPages) ||
                    Number(payload?.pagination?.totalPages) ||
                    1;

                setTotalPages(resolvedTotalPages > 0 ? resolvedTotalPages : 1);
            } catch {
                setError("Unable to load your orders right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, page, limit]);

    const formatDate = (value: string) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (value: string | number) => {
        const amount = typeof value === "string" ? Number(value) : value;
        return `₹${Number.isFinite(amount) ? Math.round(amount).toLocaleString("en-IN") : "0"}`;
    };

    const normalizeStatus = (value: unknown) => {
        return String(value ?? "")
            .toLowerCase()
            .replace(/[_\s-]+/g, "")
            .trim();
    };

    const canCancelOrder = (orderStatus: string, paymentStatus: string) => {
        const allowed = ["paid", "pending", "confirmed"];
        return allowed.includes(orderStatus) || allowed.includes(paymentStatus);
    };

    const handleOpenCancelConfirm = (orderId: string) => {
        setConfirmOrderId(orderId);
    };

    const handleCancelOrder = async () => {
        if (!confirmOrderId || cancellingId) return;

        setCancellingId(confirmOrderId);
        setError("");

        try {
            await cancelOrder(confirmOrderId);

            setOrders((prev) =>
                prev.map((order) => {
                    const rowId = String(order?.id ?? order?._id ?? order?.orderId ?? "");
                    if (rowId !== confirmOrderId) return order;
                    return {
                        ...order,
                        status: "cancelled",
                    };
                })
            );

            setSuccessMessage("Cancelled successfully");
            setConfirmOrderId("");
        } catch {
            setError("Unable to cancel this order right now.");
        } finally {
            setCancellingId("");
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-[#0065A6] hover:text-black mb-8"
                >
                    <ArrowLeft size={18} />
                    Back to Profile
                </Link>

                <div className="bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-black/10 bg-gray-50/70">
                        <h1 className="text-2xl font-bold">My Orders</h1>
                        <p className="text-sm text-black/55 mt-1">
                            Track your recent purchases and payment status.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8">
                        {!!successMessage && (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                {successMessage}
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center gap-3 text-black/55 py-4">
                                <Clock3 size={18} className="animate-spin" />
                                Loading orders...
                            </div>
                        )}

                        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

                        {!loading && !error && orders.length === 0 && (
                            <div className="text-center py-12 text-black/45">
                                <Package size={42} className="mx-auto mb-3 opacity-60" />
                                <p className="text-sm">No orders found yet.</p>
                                <Link
                                    href="/products"
                                    className="inline-block mt-3 text-sm font-medium text-[#0065A6] hover:underline"
                                >
                                    Browse products
                                </Link>
                            </div>
                        )}

                        {!loading && !error && orders.length > 0 && (
                            <div className="space-y-4">
                                {orders.map((order: any, index: number) => {
                                    const id = order?.id ?? order?._id ?? order?.orderId ?? String(index);
                                    const orderStatus = normalizeStatus(order?.status);
                                    const paymentStatus = normalizeStatus(order?.paymentStatus);
                                    const status = orderStatus || paymentStatus || "pending";
                                    const createdAt = order?.createdAt ?? order?.created_at ?? "";
                                    const total = order?.totalAmount ?? order?.total ?? order?.amount ?? 0;
                                    let products: any[] = [];
                                    if (Array.isArray(order?.Products)) {
                                        products = order.Products;
                                    } else if (Array.isArray(order?.items)) {
                                        products = order.items;
                                    }

                                    return (
                                        <Link
                                            key={id}
                                            href={`/order-success?orderId=${id}`}
                                            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-black/10 p-4 hover:shadow-md transition"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Order <span className="text-[#0065A6]">{formatShortUuid(id, { prefix: "ORD-", length: 8 })}</span>
                                                </p>
                                                <p className="text-xs text-black/55 mt-1">
                                                    {formatDate(createdAt)}
                                                    {products.length > 0 && ` · ${products.length} item${products.length === 1 ? "" : "s"}`}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-4">
                                                {canCancelOrder(orderStatus, paymentStatus) && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            handleOpenCancelConfirm(String(id));
                                                        }}
                                                        disabled={cancellingId === String(id)}
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {cancellingId === String(id) ? "Cancelling..." : "Cancel"}
                                                    </button>
                                                )}

                                                <span
                                                    className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColor[status] ?? "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {status}
                                                </span>
                                                <p className="text-sm font-bold">{formatCurrency(total)}</p>
                                                <ChevronRight size={16} className="text-black/30 group-hover:text-[#0065A6] transition" />
                                            </div>
                                        </Link>
                                    );
                                })}

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                        disabled={page === 1 || loading}
                                        className="px-4 py-2 rounded-lg border border-black/15 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0065A6]"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-black/60">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={page >= totalPages || loading}
                                        className="px-4 py-2 rounded-lg border border-black/15 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0065A6]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {confirmOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-black">Cancel order?</h2>
                        <p className="mt-2 text-sm text-black/65">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmOrderId("")}
                                disabled={!!cancellingId}
                                className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelOrder}
                                disabled={!!cancellingId}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cancellingId ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
