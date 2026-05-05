"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    LogOut,
    ChevronRight,
    ArrowLeft,
    Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import ProfileUpdateForm from "@/components/ProfileUpdateForm";
import { useAuth } from "@/hooks/useAuth";
import { getOrders } from "@/services/order.service";

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
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export default function ProfilePage() {
    const router = useRouter();
    const { logoutAction } = useAuth();
    const rawUser = useSelector((state: RootState) => state.user.user);

    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState("");
    const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Redirect if not logged in
    useEffect(() => {
        if (!rawUser) {
            router.push("/login");
        }
    }, [rawUser, router]);

    // Fetch orders
    useEffect(() => {
        if (!rawUser) return;
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

                setOrders(Array.isArray(data) ? data : []);

                const resolvedTotalPages =
                    Number(payload?.totalPages) ||
                    Number(res?.data?.totalPages) ||
                    Number(payload?.pagination?.totalPages) ||
                    1;

                setTotalPages(resolvedTotalPages > 0 ? resolvedTotalPages : 1);
            } catch {
                setOrdersError("Failed to load orders.");
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, [rawUser, page, limit]);

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
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatAmount = (val: number) =>
        `₹${Math.round(val).toLocaleString("en-IN")}`;

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Back */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-[#0065A6] hover:text-black mb-8 w-fit"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                {/* Profile header */}
                <div className="bg-white shadow-2xl rounded-3xl border border-black/10 overflow-hidden mb-6">
                    <div className="bg-[#0065A6] px-8 py-8 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-white text-[#0065A6] flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
                            {avatarLetter}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                            {email && (
                                <p className="text-white/80 text-sm mt-0.5">{email}</p>
                            )}
                        </div>
                        <button
                            onClick={logoutAction}
                            className="ml-auto flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-black/10">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`px-6 py-4 text-sm font-semibold transition ${activeTab === "info"
                                ? "border-b-2 border-[#0065A6] text-[#0065A6]"
                                : "text-black/50 hover:text-black"
                                }`}
                        >
                            Account Info
                        </button>
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`px-6 py-4 text-sm font-semibold transition flex items-center gap-2 ${activeTab === "orders"
                                ? "border-b-2 border-[#0065A6] text-[#0065A6]"
                                : "text-black/50 hover:text-black"
                                }`}
                        >
                            <Package size={15} />
                            My Orders
                            {orders.length > 0 && (
                                <span className="bg-[#0065A6] text-white text-xs rounded-full px-2 py-0.5">
                                    {orders.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Account Info Tab */}
                    {activeTab === "info" && (
                        <div className="px-8 py-8">
                            <div className="mb-6 flex flex-wrap items-center gap-3">


                                <div className="flex items-center gap-2">
                                    <ProfileUpdateForm user={user} />
                                    <ChangePasswordModal />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoRow icon={<User size={18} />} label="Full Name" value={fullName} />
                                <InfoRow
                                    icon={<Mail size={18} />}
                                    label="Email Address"
                                    value={email || "—"}
                                />
                                <InfoRow
                                    icon={<Phone size={18} />}
                                    label="Mobile Number"
                                    value={phone || "—"}
                                />
                                <InfoRow
                                    icon={<User size={18} />}
                                    label="Gender"
                                    value={gender ? `${gender.charAt(0).toUpperCase()}${gender.slice(1)}` : "—"}
                                />
                                <InfoRow
                                    icon={<MapPin size={18} />}
                                    label="Date of Birth"
                                    value={dateOfBirth ? formatDate(dateOfBirth) : "—"}
                                />

                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="px-8 py-8">
                            <h2 className="text-lg font-semibold mb-6 text-black">
                                Order History
                            </h2>

                            {ordersLoading && (
                                <div className="flex items-center gap-3 text-black/50 py-6">
                                    <Clock size={18} className="animate-spin" />
                                    Loading orders…
                                </div>
                            )}

                            {ordersError && !ordersLoading && (
                                <p className="text-red-500 text-sm">{ordersError}</p>
                            )}

                            {!ordersLoading && !ordersError && orders.length === 0 && (
                                <div className="text-center py-12 text-black/40">
                                    <Package size={40} className="mx-auto mb-3 opacity-40" />
                                    <p className="text-sm">No orders found.</p>
                                    <Link
                                        href="/products"
                                        className="mt-4 inline-block text-[#0065A6] text-sm font-medium hover:underline"
                                    >
                                        Start shopping →
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
                                        const itemCount =
                                            order.items?.length ??
                                            order.orderItems?.length ??
                                            0;

                                        return (
                                            <Link
                                                key={orderId}
                                                href={`/order-success?orderId=${orderId}`}
                                                className="flex items-center justify-between p-4 rounded-2xl border border-black/10 hover:shadow-md transition group"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-black">
                                                        Order{" "}
                                                        <span className="text-[#0065A6]">
                                                            #{String(orderId).slice(-8).toUpperCase()}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-black/50 mt-0.5">
                                                        {formatDate(createdAt)}
                                                        {itemCount > 0 && ` · ${itemCount} item${itemCount === 1 ? "" : "s"}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColor[status] ?? "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {status}
                                                    </span>
                                                    <p className="text-sm font-bold text-black">
                                                        {formatAmount(total)}
                                                    </p>
                                                    <ChevronRight
                                                        size={16}
                                                        className="text-black/30 group-hover:text-[#0065A6] transition"
                                                    />
                                                </div>
                                            </Link>
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
                </div>
            </div>
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
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-black/5">
            <span className="text-[#0065A6] mt-0.5">{icon}</span>
            <div>
                <p className="text-xs text-black/40 font-medium uppercase tracking-wide mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-semibold text-black break-all">{value}</p>
            </div>
        </div>
    );
}
