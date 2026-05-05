"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, ImagePlus, RotateCcw, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import { extractOrderFromResponse, getOrderById } from "@/services/order.service";
import { createReturnRequest } from "@/services/return.service";

type RootState = {
    user: { user: unknown };
};

type ReturnableItem = {
    id: string;
    name: string;
    quantity: number;
    orderItemId: string;
};

export default function ReturnsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useSelector((state: RootState) => state.user.user);

    const orderId = searchParams.get("orderId") || "";

    const [loadingOrder, setLoadingOrder] = useState(false);
    const [items, setItems] = useState<ReturnableItem[]>([]);

    const [selectedItemId, setSelectedItemId] = useState("");
    const [orderItemId, setOrderItemId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    useEffect(() => {
        if (!user || !orderId) return;

        const fetchOrder = async () => {
            setLoadingOrder(true);
            setError("");
            try {
                const res = await getOrderById(orderId);
                const order = extractOrderFromResponse(res);

                let products: any[] = [];
                if (Array.isArray(order?.Products)) {
                    products = order.Products;
                } else if (Array.isArray(order?.items)) {
                    products = order.items;
                }

                const mapped: ReturnableItem[] = products.map((product: any, index: number) => {
                    const fallbackId = String(index + 1);
                    const productId = String(product?.id ?? product?._id ?? fallbackId);
                    const productName = String(product?.name ?? `Item ${index + 1}`);
                    const productQuantity = Number(product?.OrderItem?.quantity ?? product?.quantity ?? 1);
                    const derivedOrderItemId =
                        product?.OrderItem?.id ??
                        product?.OrderItem?.orderItemId ??
                        product?.OrderItem?.order_item_id ??
                        product?.OrderItem?.uuid ??
                        product?.orderItemId ??
                        product?.order_item_id ??
                        product?.itemId ??
                        productId;

                    return {
                        id: productId,
                        name: productName,
                        quantity: Number.isFinite(productQuantity) && productQuantity > 0 ? productQuantity : 1,
                        orderItemId: typeof derivedOrderItemId === "string" ? derivedOrderItemId : "",
                    };
                });

                setItems(mapped);

                if (mapped.length > 0) {
                    setSelectedItemId(mapped[0].id);
                    setOrderItemId(mapped[0].orderItemId || "");
                    setQuantity(1);
                }
            } catch (err: any) {
                const message = err?.response?.data?.message || "Unable to load order items for return.";
                setError(message);
            } finally {
                setLoadingOrder(false);
            }
        };

        fetchOrder();
    }, [orderId, user]);

    const selectedItem = useMemo(() => {
        return items.find((item) => item.id === selectedItemId) || null;
    }, [items, selectedItemId]);

    useEffect(() => {
        if (!selectedItem) return;
        setOrderItemId(selectedItem.orderItemId || "");
        setQuantity((prev) => {
            if (prev > selectedItem.quantity) return selectedItem.quantity;
            if (prev < 1) return 1;
            return prev;
        });
    }, [selectedItem]);

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setImage(file);
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!orderItemId.trim()) {
            setError("Order item id is required.");
            return;
        }

        if (!reason.trim()) {
            setError("Please enter a return reason.");
            return;
        }

        if (!Number.isFinite(quantity) || quantity < 1) {
            setError("Quantity must be at least 1.");
            return;
        }

        if (selectedItem && quantity > selectedItem.quantity) {
            setError(`You can return up to ${selectedItem.quantity} item(s) for this product.`);
            return;
        }

        const payload = new FormData();
        payload.append("orderItemId", orderItemId.trim());
        payload.append("quantity", String(quantity));
        payload.append("reason", reason.trim());

        if (image) {
            payload.append("image", image);
        }

        setSubmitting(true);
        try {
            await createReturnRequest(payload);
            setSuccess("Return request submitted successfully.");
            setReason("");
            setImage(null);
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to submit return request.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link
                    href={orderId ? `/order-success?orderId=${orderId}` : "/orders"}
                    className="inline-flex items-center gap-2 text-[#0065A6] hover:text-black mb-8"
                >
                    <ArrowLeft size={18} />
                    Back
                </Link>

                <div className="rounded-3xl border border-black/10 shadow-2xl overflow-hidden bg-white">
                    <div className="px-6 sm:px-8 py-6 bg-[#0065A6] text-white">
                        <h1 className="text-2xl font-bold">Return Order</h1>
                        <p className="text-sm text-white/85 mt-1">
                            Submit a return request for a specific order item.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="px-6 sm:px-8 py-8 space-y-5">
                        {loadingOrder && <p className="text-sm text-black/60">Loading order items...</p>}

                        {orderId && items.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold mb-2">Select Product</label>
                                <select
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                    className="w-full rounded-xl border border-black/15 p-3 text-sm outline-none focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30"
                                >
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Max Qty: {item.quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="orderItemId" className="block text-sm font-semibold mb-2">
                                Order Item Id
                            </label>
                            <input
                                id="orderItemId"
                                value={orderItemId}
                                readOnly
                                className="w-full rounded-xl border border-black/15 p-3 text-sm bg-gray-50 text-black/70"
                            />
                            <p className="text-xs text-black/45 mt-1">
                                Auto-generated from your selected order item.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="block text-sm font-semibold mb-2">
                                Quantity
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min={1}
                                max={selectedItem?.quantity || undefined}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full rounded-xl border border-black/15 p-3 text-sm outline-none focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30"
                            />
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-semibold mb-2">
                                Reason
                            </label>
                            <textarea
                                id="reason"
                                rows={4}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Wrong product delivered"
                                className="w-full rounded-xl border border-black/15 p-3 text-sm outline-none focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30"
                            />
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-semibold mb-2">
                                Upload Image (Optional)
                            </label>
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="image"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:border-[#0065A6]"
                                >
                                    <ImagePlus size={16} />
                                    Choose File
                                </label>
                                <span className="text-sm text-black/55 truncate">
                                    {image ? image.name : "No file selected"}
                                </span>
                            </div>
                            <input id="image" type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-black/10 p-4 flex items-start gap-3">
                            <ShieldAlert size={18} className="text-[#0065A6] mt-0.5 shrink-0" />
                            <p className="text-sm text-black/70">
                                Return requests are reviewed by support. Keep packaging and proof image for faster approval.
                            </p>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {success && <p className="text-sm text-green-700">{success}</p>}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0065A6] hover:bg-[#00558d] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <RotateCcw size={16} />
                                {submitting ? "Submitting..." : "Submit Return"}
                            </button>

                            <Link href="/orders" className="text-sm font-semibold text-black/65 hover:text-black">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
