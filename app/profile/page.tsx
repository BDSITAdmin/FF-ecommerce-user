"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Copy,
    Check,
    Download,
    ChevronRight,
    Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileUpdateForm from "@/components/ProfileUpdateForm";
import { cancelOrder, downloadOrderInvoice, getOrders, getShipmentById } from "@/services/order.service";

type RootState = {
    user: { user: unknown };
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

const getString = (obj: Record<string, unknown>, ...keys: string[]): string => {
    for (const k of keys) {
        const val = obj[k];
        if (typeof val === "string" && val.trim()) return val.trim();
    }
    return "";
};

const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-[#0065A6]",
    shipped: "bg-purple-100 text-purple-700",
    hold: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const paymentStatusColor: Record<string, string> = {
    paid: "text-green-700",
    pending: "text-amber-700",
    failed: "text-red-700",
    refunded: "text-indigo-700",
};

const canTrackOrderStatus = (status: string) => {
    const normalized = status.toLowerCase();
    return normalized === "shipped";
};

const normalizeStatus = (value: unknown) =>
    String(value ?? "")
        .toLowerCase()
        .replace(/[_\s-]+/g, "")
        .trim();

const canCancelOrder = (status: string) => {
    return ["paid", "pending", "confirmed"].includes(status);
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getOrderKey = (order: any) =>
    String(order?._id ?? order?.id ?? order?.orderId ?? "");

const getEstimatedDeliveryLabel = (order: any, status: string, shipment?: any) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "delivered") return "Delivered";

    const estimatedDateRaw =
        shipment?.estimatedDeliveryAt ??
        order?.estimatedDeliveryAt ??
        order?.shipment?.estimatedDeliveryAt ??
        null;

    if (estimatedDateRaw) {
        const estimatedDate = new Date(estimatedDateRaw);
        if (!Number.isNaN(estimatedDate.getTime())) {
            const now = new Date();
            const diffDays = Math.ceil((estimatedDate.getTime() - now.getTime()) / MS_PER_DAY);
            const days = Math.max(0, diffDays);
            return days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`;
        }
    }

    if (["shipped", "in_transit", "out_for_delivery"].includes(normalizedStatus)) {
        const baseDateRaw = order?.shippedAt ?? order?.paidAt ?? order?.createdAt ?? order?.created_at;
        const baseDate = new Date(baseDateRaw);
        if (!Number.isNaN(baseDate.getTime())) {
            const fallbackDelivery = new Date(baseDate.getTime() + 5 * MS_PER_DAY);
            const now = new Date();
            const diffDays = Math.ceil((fallbackDelivery.getTime() - now.getTime()) / MS_PER_DAY);
            const days = Math.max(0, diffDays);
            return days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`;
        }
        return "5 days";
    }

    return "-";
};

const recentRequestTimestamps = new Map<string, number>();

const wasRecentlyRequested = (key: string, windowMs = 1200) => {
    const now = Date.now();
    const lastRequestedAt = recentRequestTimestamps.get(key) ?? 0;

    if (now - lastRequestedAt < windowMs) {
        return true;
    }

    recentRequestTimestamps.set(key, now);
    return false;
};

export default function ProfilePage() {
    const router = useRouter();
    const rawUser = useSelector((state: RootState) => state.user.user);

    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState("");
    const [orderActionMessage, setOrderActionMessage] = useState("");
    const [trackingError, setTrackingError] = useState("");
    const [invoiceDownloadingOrderId, setInvoiceDownloadingOrderId] = useState<string | null>(null);
    const [shipmentByOrderId, setShipmentByOrderId] = useState<Record<string, any>>({});
    const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
    const [confirmCancelOrderId, setConfirmCancelOrderId] = useState<string>("");
    const [cancellingOrderId, setCancellingOrderId] = useState<string>("");
    const [activeSection, setActiveSection] = useState<"info" | "orders">("info");
    const [showUpdateProfile, setShowUpdateProfile] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const userSessionKey = useMemo(() => {
        if (!rawUser) return "";
        if (!isRecord(rawUser)) return "authenticated";

        const source = isRecord(rawUser.user) ? rawUser.user : rawUser;
        return getString(source, "id", "_id", "userId") || "authenticated";
    }, [rawUser]);

    useEffect(() => {
        if (!rawUser) {
            router.push("/login");
        }
    }, [rawUser, router]);

    useEffect(() => {
        if (!userSessionKey) return;

        let cancelled = false;

        const fetchOrders = async () => {
            setOrdersLoading(true);
            setOrdersError("");
            try {
                const res = await getOrders({ page, limit });

                const payload = res?.data?.data ?? res?.data ?? {};
                const data =
                    payload?.orders ??
                    res?.data?.orders ??
                    payload?.docs ??
                    payload?.items ??
                    [];

                if (cancelled) return;
                setOrders(Array.isArray(data) ? data : []);

                const resolvedTotalPages =
                    Number(payload?.totalPages) ||
                    Number(res?.data?.totalPages) ||
                    Number(payload?.pagination?.totalPages) ||
                    1;

                setTotalPages(resolvedTotalPages > 0 ? resolvedTotalPages : 1);
            } catch {
                if (cancelled) return;
                setOrdersError("Failed to load orders.");
            } finally {
                if (cancelled) return;
                setOrdersLoading(false);
            }
        };

        fetchOrders();

        return () => {
            cancelled = true;
        };
    }, [userSessionKey, page, limit]);

    useEffect(() => {
        if (!userSessionKey || orders.length === 0) {
            setShipmentByOrderId({});
            return;
        }

        let cancelled = false;

        const fetchShipmentDetailsForTrackableOrders = async () => {
            const trackableOrders = orders.filter((order: any) => {
                const status = String(order?.status ?? order?.orderStatus ?? "").toLowerCase();
                return canTrackOrderStatus(status) && Boolean(order?.shipmentId ?? order?.shipment?.id);
            });

            if (trackableOrders.length === 0) {
                if (!cancelled) setShipmentByOrderId({});
                return;
            }

            const shipmentRequestKey = `shipments:${trackableOrders
                .map((order: any) => `${getOrderKey(order)}:${String(order?.shipmentId ?? order?.shipment?.id ?? "")}`)
                .sort()
                .join("|")}`;

            if (wasRecentlyRequested(shipmentRequestKey)) return;

            const responses = await Promise.all(
                trackableOrders.map(async (order: any) => {
                    const shipmentId = order?.shipmentId ?? order?.shipment?.id;
                    const orderKey = getOrderKey(order);

                    try {
                        const res = await getShipmentById(shipmentId);
                        const shipment =
                            res?.data?.data?.shipment ??
                            res?.data?.shipment ??
                            null;

                        return shipment ? [orderKey, shipment] : null;
                    } catch {
                        return null;
                    }
                })
            );

            if (cancelled) return;

            const nextMap: Record<string, any> = {};
            for (const entry of responses) {
                if (!entry) continue;
                const [orderKey, shipment] = entry;
                nextMap[orderKey] = shipment;
            }

            setShipmentByOrderId(nextMap);
        };

        fetchShipmentDetailsForTrackableOrders();

        return () => {
            cancelled = true;
        };
    }, [userSessionKey, orders]);

    if (!rawUser) return null;

    let user: Record<string, unknown> = {};
    if (isRecord(rawUser)) {
        user = isRecord(rawUser.user) ? rawUser.user : rawUser;
    }

    const fullName =
        `${getString(user, "firstName", "first_name", "firstname", "givenName")} ${getString(user, "lastName", "last_name", "lastname", "familyName")}`.trim() ||
        "User";
    const email = getString(user, "email");
    const phone = getString(user, "phone", "phoneNumber", "mobile");
    const dateOfBirth = getString(user, "dateOfBirth", "dob");
    const gender = getString(user, "gender");
    const avatarLetter = fullName.charAt(0).toUpperCase();

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatAmount = (val: number) =>
        `₹${Math.round(val).toLocaleString("en-IN")}`;

    const handleTrackOrder = (order: any) => {
        const status = String(order?.status ?? order?.orderStatus ?? "").toLowerCase();
        if (!canTrackOrderStatus(status)) return;

        const orderId = getOrderKey(order);
        const trackingLink = shipmentByOrderId[orderId]?.trackingLink ?? "";
        setTrackingError("");

        if (!trackingLink) {
            setTrackingError("Tracking link is not available yet.");
            return;
        }

        const newWindow = globalThis.window.open(
            trackingLink,
            "_blank",
            "noopener,noreferrer"
        );
        if (!newWindow) {
            setTrackingError("Please allow pop-ups to open the tracking link in a new tab.");
        }
    };

    const handleCopyConsignment = async (orderId: string, consignmentId: string) => {
        if (!consignmentId || consignmentId === "-") return;
        try {
            await globalThis.navigator.clipboard.writeText(consignmentId);
            setCopiedOrderId(orderId);
            globalThis.window.setTimeout(() => {
                setCopiedOrderId((prev) => (prev === orderId ? null : prev));
            }, 1200);
        } catch {
            setTrackingError("Unable to copy consignment ID.");
        }
    };

    const getInvoiceFileName = (orderId: string, contentDisposition?: string) => {
        if (contentDisposition) {
            const fileNameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
            const matchedName = fileNameMatch?.[1] ?? fileNameMatch?.[2];
            if (matchedName) {
                try {
                    return decodeURIComponent(matchedName.replaceAll(/['"]/g, ""));
                } catch {
                    return matchedName;
                }
            }
        }

        return `invoice-${String(orderId).slice(-8).toUpperCase()}.pdf`;
    };

    const handleDownloadInvoice = async (order: any) => {
        const status = String(order?.status ?? order?.orderStatus ?? "").toLowerCase();
        if (status !== "delivered") return;

        const orderId = getOrderKey(order);
        if (!orderId) {
            setTrackingError("Order ID not found for invoice download.");
            return;
        }

        setTrackingError("");
        setInvoiceDownloadingOrderId(orderId);

        try {
            const res = await downloadOrderInvoice(orderId);
            const fileName = getInvoiceFileName(orderId, res?.headers?.["content-disposition"]);
            const blob = new Blob([res.data], { type: "application/pdf" });

            const blobUrl = globalThis.window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = blobUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            globalThis.window.URL.revokeObjectURL(blobUrl);
        } catch {
            setTrackingError("Unable to download invoice right now.");
        } finally {
            setInvoiceDownloadingOrderId(null);
        }
    };

    const handleConfirmCancelOrder = (orderId: string) => {
        setOrderActionMessage("");
        setTrackingError("");
        setConfirmCancelOrderId(orderId);
    };

    const handleCancelOrder = async () => {
        if (!confirmCancelOrderId || cancellingOrderId) return;

        setCancellingOrderId(confirmCancelOrderId);
        setOrderActionMessage("");
        setTrackingError("");

        try {
            await cancelOrder(confirmCancelOrderId);

            setOrders((prev) =>
                prev.map((order) => {
                    const currentId = getOrderKey(order);
                    if (currentId !== confirmCancelOrderId) return order;

                    return {
                        ...order,
                        status: "cancelled",
                        paymentStatus: "cancelled",
                    };
                })
            );

            setOrderActionMessage("Cancelled successfully");
            setConfirmCancelOrderId("");
        } catch {
            setTrackingError("Unable to cancel this order right now.");
        } finally {
            setCancellingOrderId("");
        }
    };

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-black/10 overflow-hidden bg-white lg:min-h-[calc(100vh-8.5rem)]">
                    <aside className="lg:col-span-4 xl:col-span-3 bg-[#f8fbff] lg:border-r border-black/10 min-h-full">
                        <div className="h-full">
                            <div className="bg-linear-to-br from-[#005a93] to-[#1790d8] px-6 py-7 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-white text-[#0065A6] flex items-center justify-center text-xl font-bold shadow-md shrink-0 ring-4 ring-white/30">
                                    {avatarLetter}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-white truncate">{fullName}</h1>
                                    {email && (
                                        <p className="text-white/80 text-xs mt-0.5 truncate">{email}</p>
                                    )}
                                </div>
                            </div>

                            <nav className="p-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection("info")}
                                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition flex items-center justify-between border ${
                                        activeSection === "info"
                                            ? "bg-[#0065A6]/10 text-[#0065A6] border-[#0065A6]/25"
                                            : "text-black/70 hover:bg-gray-50 border-transparent"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <User size={16} />
                                        Account Info
                                    </span>
                                    <ChevronRight size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveSection("orders")}
                                    className={`mt-2 w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition flex items-center justify-between border ${
                                        activeSection === "orders"
                                            ? "bg-[#0065A6]/10 text-[#0065A6] border-[#0065A6]/25"
                                            : "text-black/70 hover:bg-gray-50 border-transparent"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Package size={16} />
                                        My Orders
                                    </span>
                                    <span className="flex items-center gap-2">
                                        {orders.length > 0 && (
                                            <span className="bg-[#0065A6] text-white text-xs rounded-full px-2 py-0.5">
                                                {orders.length}
                                            </span>
                                        )}
                                        <ChevronRight size={15} />
                                    </span>
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <section className="lg:col-span-8 xl:col-span-9 bg-white min-h-full">
                        {activeSection === "info" && (
                            <div className="px-6 sm:px-8 py-8">
                                <div className="flex items-center justify-between gap-3 mb-6 border-b border-black/10 pb-5">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0065A6]">Profile</p>
                                        <h2 className="text-2xl font-extrabold text-black mt-1">Account Info</h2>
                                        <p className="text-sm text-black/60 mt-1">
                                            Manage your personal details in one place.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <InfoRow icon={<User size={18} />} label="Full Name" value={fullName} />
                                    <InfoRow
                                        icon={<Mail size={18} />}
                                        label="Email Address"
                                        value={email || "-"}
                                    />
                                    <InfoRow
                                        icon={<Phone size={18} />}
                                        label="Mobile Number"
                                        value={phone || "-"}
                                    />
                                    <InfoRow
                                        icon={<User size={18} />}
                                        label="Gender"
                                        value={gender ? `${gender.charAt(0).toUpperCase()}${gender.slice(1)}` : "-"}
                                    />
                                    <InfoRow
                                        icon={<MapPin size={18} />}
                                        label="Date of Birth"
                                        value={dateOfBirth ? formatDate(dateOfBirth) : "-"}
                                    />
                                </div>

                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <Link
                                        href="/profile/change-password"
                                        className="inline-flex items-center justify-center rounded-xl border border-[#0065A6]/25 bg-[#0065A6]/5 px-5 py-2.5 text-sm font-semibold text-[#005a93] hover:bg-[#0065A6]/10 transition"
                                    >
                                        Change Password
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setShowUpdateProfile((prev) => !prev)}
                                        className="inline-flex items-center justify-center rounded-xl border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition"
                                    >
                                        {showUpdateProfile ? "Hide Update Profile" : "Update Profile"}
                                    </button>
                                </div>

                                {showUpdateProfile && (
                                    <div className="mt-6">
                                        <ProfileUpdateForm user={user} inline />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === "orders" && (
                            <div className="px-6 sm:px-8 py-8">
                                <div className="mb-6 border-b border-black/10 pb-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0065A6]">Orders</p>
                                    <h2 className="text-2xl font-extrabold text-black mt-1">Order History</h2>
                                </div>

                                {ordersLoading && (
                                    <div className="flex items-center gap-3 text-black/50 py-6">
                                        <Clock size={18} className="animate-spin" />
                                        Loading orders...
                                    </div>
                                )}

                                {ordersError && !ordersLoading && (
                                    <p className="text-red-500 text-sm">{ordersError}</p>
                                )}

                                {!ordersLoading && !!orderActionMessage && (
                                    <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                                        {orderActionMessage}
                                    </p>
                                )}

                                {!ordersLoading && trackingError && (
                                    <p className="text-red-500 text-sm mb-3">{trackingError}</p>
                                )}

                                {!ordersLoading && !ordersError && orders.length === 0 && (
                                    <div className="text-center py-12 text-black/40 border border-dashed border-black/15 rounded-2xl bg-white">
                                        <Package size={40} className="mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">No orders found.</p>
                                        <Link
                                            href="/products"
                                            className="mt-4 inline-block text-[#0065A6] text-sm font-medium hover:underline"
                                        >
                                            Start shopping
                                        </Link>
                                    </div>
                                )}

                                {!ordersLoading && orders.length > 0 && (
                                    <div className="flex flex-col gap-4">
                                        {orders.map((order: any, idx: number) => {
                                            const orderId =
                                                order._id ?? order.id ?? order.orderId ?? `#${idx + 1}`;
                                            const status = (
                                                order.status ??
                                                order.orderStatus ??
                                                "pending"
                                            ).toLowerCase();
                                            const total =
                                                order.totalAmount ??
                                                order.total ??
                                                order.amount ??
                                                0;
                                            const createdAt =
                                                order.createdAt ?? order.created_at ?? "";
                                            const rawOrderItems =
                                                Array.isArray(order.items) && order.items.length > 0
                                                    ? order.items
                                                    : Array.isArray(order.orderItems)
                                                        ? order.orderItems
                                                        : [];
                                            const normalizedOrderItems = rawOrderItems.map((item: any, itemIndex: number) => {
                                                const product = item?.product ?? {};
                                                const quantity = Number(item?.quantity ?? 1) || 1;
                                                const packSize = Number(item?.packSize ?? item?.pack?.quantity ?? 1) || 1;
                                                const unitPrice = Number(item?.price ?? product?.price ?? 0) || 0;
                                                const packCost = unitPrice * packSize * quantity;

                                                return {
                                                    key: String(item?.orderItemId ?? item?.id ?? `${itemIndex}`),
                                                    name: String(product?.name ?? item?.name ?? "Product"),
                                                    image: product?.images?.[0] ?? item?.image ?? "/assate/home-image.webp",
                                                    quantity,
                                                    packSize,
                                                    unitPrice,
                                                    packCost,
                                                };
                                            });
                                            const itemCount = normalizedOrderItems.length;
                                            const totalUnits = normalizedOrderItems.reduce(
                                                (sum: number, item: { quantity: number; packSize: number }) =>
                                                    sum + item.quantity * item.packSize,
                                                0
                                            );
                                            const paymentStatus = String(
                                                order.paymentStatus ??
                                                order.transaction?.paymentStatus ??
                                                "pending"
                                            ).toLowerCase();
                                            const normalizedOrderStatus = normalizeStatus(order.status ?? order.orderStatus ?? "pending");
                                            const normalizedPaymentStatus = normalizeStatus(order.paymentStatus ?? order.transaction?.paymentStatus ?? "pending");
                                            const paymentMethod =
                                                order.paymentMethod ??
                                                order.paymentGateway ??
                                                "-";
                                            const city = order.shippingAddress?.city ?? "";
                                            const state = order.shippingAddress?.state ?? "";
                                            const zipCode = order.shippingAddress?.zipCode ?? "";
                                            const remarks = String(order.remarks ?? "").trim();
                                            const locationParts = [city, state, zipCode].filter(Boolean);
                                            const firstOrderItem = normalizedOrderItems[0];
                                            const productName =
                                                firstOrderItem?.name ?? "Product";
                                            const productImage =
                                                firstOrderItem?.image ??
                                                "/assate/home-image.webp";

                                            const showTrackButton = canTrackOrderStatus(status);
                                            const showInvoiceButton = status === "delivered";
                                            const currentOrderId = String(orderId);
                                            const shipmentDetails = shipmentByOrderId[currentOrderId];
                                            const estimatedDelivery = getEstimatedDeliveryLabel(order, status, shipmentDetails);
                                            const consignmentId =
                                                shipmentDetails?.consignmentId ?? "-";
                                            const shippedBy =
                                                shipmentDetails?.shippedBy ?? "-";
                                            const shippedAt =
                                                shipmentDetails?.shippedAt ?? order?.shippedAt ?? "";

                                            return (
                                                <div
                                                    key={orderId}
                                                    className="relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl border border-black/10 bg-white hover:border-[#0065A6]/30 transition"
                                                >
                                                    <span
                                                        className={`absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full capitalize ${
                                                            statusColor[status] ?? "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>

                                                    <div className="md:col-span-2 lg:col-span-2">
                                                        <img
                                                            src={productImage}
                                                            alt={productName}
                                                            className="h-28 w-28 md:h-32 md:w-32 rounded-lg border border-black/10 object-cover"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-3 lg:col-span-3">
                                                        <div>
                                                            <h3 className="mt-2 text-md font-bold text-black leading-snug wrap-break-word">
                                                                {productName}
                                                            </h3>
                                                            <p className="text-sm font-semibold text-black">
                                                                Order <span className="text-[#0065A6]">#{String(orderId).slice(-8).toUpperCase()}</span>
                                                            </p>
                                                            <p className="text-xs text-black/50 mt-0.5">
                                                                {formatDate(createdAt)}
                                                                {itemCount > 0 && ` · ${itemCount} item${itemCount === 1 ? "" : "s"}`}
                                                                {totalUnits > 0 && ` · ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`}
                                                            </p>

                                                            

                                                            {showTrackButton && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTrackOrder(order)}
                                                                    disabled={!shipmentDetails?.trackingLink}
                                                                    className="mt-3 rounded-lg bg-[#0065A6] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#005183] transition"
                                                                >
                                                                    Track Order
                                                                </button>
                                                            )}

                                                            {showInvoiceButton && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDownloadInvoice(order)}
                                                                    disabled={invoiceDownloadingOrderId === currentOrderId}
                                                                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#7b1f13] bg-[#7b1f13] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#70462D] transition"
                                                                >
                                                                    <Download size={13} />
                                                                    {invoiceDownloadingOrderId === currentOrderId
                                                                        ? "Downloading..."
                                                                        : "Download Invoice"}
                                                                </button>
                                                            )}

                                                            {canCancelOrder(normalizedOrderStatus) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleConfirmCancelOrder(currentOrderId)}
                                                                    disabled={cancellingOrderId === currentOrderId}
                                                                    className="mt-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    {cancellingOrderId === currentOrderId ? "Cancelling..." : "Cancel Order"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0 md:col-span-7 lg:col-span-7">
                                                        {normalizedOrderItems.length > 0 && (
                                                            <div className="space-y-2 rounded-xl border border-black/10 bg-[#fafcff] p-3">
                                                                {normalizedOrderItems.map((item: any) => (
                                                                    <div
                                                                        key={item.key}
                                                                        className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-2"
                                                                    >
                                                                        <div className="min-w-0 flex items-center gap-2">
                                                                            <img
                                                                                src={item.image}
                                                                                alt={item.name}
                                                                                className="h-11 w-11 rounded-md border border-black/10 object-cover"
                                                                            />
                                                                            <div className="min-w-0">
                                                                                <p className="truncate text-xs font-semibold text-black">
                                                                                    {item.name}
                                                                                </p>
                                                                                <p className="text-[11px] text-black/60">
                                                                                    Cost = {formatAmount(item.unitPrice)} x {item.packSize} x {item.quantity}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <p className="shrink-0 text-xs font-bold text-black">
                                                                            {formatAmount(item.packCost)}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-black/70">
                                                             <p className="text-sm font-bold text-black rounded-lg bg-[#f8fbff] px-2.5 py-1 border border-black/10">
                                                                Amount: <span className="font-semibold uppercase">{formatAmount(Number(total) || 0)}</span>
                                                            </p>
                                                            <p>
                                                                Payment Status:{" "}
                                                                <span
                                                                    className={`text-[11px] font-semibold uppercase ${
                                                                        paymentStatusColor[paymentStatus] ?? "text-gray-700"
                                                                    }`}
                                                                >
                                                                    {paymentStatus}
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Method: <span className="font-semibold uppercase">{String(paymentMethod)}</span>
                                                            </p>
                                                            <p>
                                                                Est. Delivery: <span className="font-semibold">{estimatedDelivery}</span>
                                                            </p>
                                                            <p>
                                                                Shipped By: <span className="font-semibold">{shippedBy}</span>
                                                            </p>
                                                            <p>
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    Consignment:
                                                                    <span className="font-semibold">{consignmentId}</span>
                                                                    {consignmentId !== "-" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCopyConsignment(currentOrderId, consignmentId)}
                                                                            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-black/5"
                                                                            aria-label="Copy consignment ID"
                                                                            title="Copy consignment ID"
                                                                        >
                                                                            {copiedOrderId === currentOrderId ? (
                                                                                <Check size={12} className="text-green-600" />
                                                                            ) : (
                                                                                <Copy size={12} className="text-black/60" />
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Shipped On: <span className="font-semibold">{formatDate(shippedAt)}</span>
                                                            </p>
                                                            {locationParts.length > 0 && (
                                                                <p>
                                                                    Ship To: <span className="font-semibold">{locationParts.join(", ")}</span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {remarks && (
                                                            <p className="mt-3 border-t border-black/10 pt-2 text-xs text-black/60 line-clamp-2">
                                                                Note: {remarks}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                                disabled={page === 1 || ordersLoading}
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
                                                disabled={page >= totalPages || ordersLoading}
                                                className="px-4 py-2 rounded-lg border border-black/15 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0065A6]"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {confirmCancelOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-black">Cancel order?</h2>
                        <p className="mt-2 text-sm text-black/65">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmCancelOrderId("")}
                                disabled={!!cancellingOrderId}
                                className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelOrder}
                                disabled={!!cancellingOrderId}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cancellingOrderId ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: Readonly<{
    icon: React.ReactNode;
    label: string;
    value: string;
}>) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-black/10 transition">
            <span className="text-[#0065A6] mt-0.5 rounded-lg bg-[#0065A6]/10 p-2">{icon}</span>
            <div>
                <p className="text-xs text-black/40 font-medium uppercase tracking-wide mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-semibold text-black break-all">{value}</p>
            </div>
        </div>
    );
}
