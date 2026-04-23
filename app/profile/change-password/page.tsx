"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

type RootState = {
    user: { user: unknown };
};

type PasswordForm = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export default function ChangePasswordPage() {
    const router = useRouter();
    const { changePasswordAction, isLoading } = useAuth();
    const user = useSelector((state: RootState) => state.user.user);

    const [form, setForm] = useState<PasswordForm>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const onChange = (key: keyof PasswordForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError("");
        setSuccess("");
    };

    const validate = () => {
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            return "All fields are required.";
        }

        if (form.newPassword.length < 8) {
            return "New password must be at least 8 characters.";
        }

        if (form.newPassword !== form.confirmPassword) {
            return "New password and confirm password must match.";
        }

        if (form.currentPassword === form.newPassword) {
            return "New password must be different from current password.";
        }

        return "";
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await changePasswordAction({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });

            setSuccess("Password changed successfully.");
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            setError(err?.message || "Unable to change password.");
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-[#0065A6] hover:text-black mb-8"
                >
                    <ArrowLeft size={18} />
                    Back to Profile
                </Link>

                <div className="rounded-3xl border border-black/10 shadow-2xl overflow-hidden bg-white">
                    <div className="px-6 sm:px-8 py-6 bg-[#0065A6] text-white">
                        <p className="text-xs tracking-[0.2em] uppercase text-white/80">Security</p>
                        <h1 className="text-2xl font-bold mt-2">Change Password</h1>
                        <p className="text-sm text-white/85 mt-1">
                            Keep your account secure by updating your password regularly.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="px-6 sm:px-8 py-8 space-y-5">
                        <PasswordField
                            id="currentPassword"
                            label="Current Password"
                            value={form.currentPassword}
                            onChange={(value) => onChange("currentPassword", value)}
                            isVisible={showCurrent}
                            onToggle={() => setShowCurrent((prev) => !prev)}
                        />

                        <PasswordField
                            id="newPassword"
                            label="New Password"
                            value={form.newPassword}
                            onChange={(value) => onChange("newPassword", value)}
                            isVisible={showNew}
                            onToggle={() => setShowNew((prev) => !prev)}
                        />

                        <PasswordField
                            id="confirmPassword"
                            label="Confirm New Password"
                            value={form.confirmPassword}
                            onChange={(value) => onChange("confirmPassword", value)}
                            isVisible={showConfirm}
                            onToggle={() => setShowConfirm((prev) => !prev)}
                        />

                        <div className="rounded-xl bg-gray-50 border border-black/10 p-4 flex items-start gap-3">
                            <ShieldCheck size={18} className="text-[#0065A6] mt-0.5 shrink-0" />
                            <p className="text-sm text-black/70">
                                Use at least 8 characters and avoid reusing your old password.
                            </p>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {success && <p className="text-sm text-green-700">{success}</p>}

                        <div className="pt-2 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0065A6] hover:bg-[#00558d] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <KeyRound size={16} />
                                {isLoading ? "Updating..." : "Update Password"}
                            </button>

                            <Link
                                href="/profile"
                                className="text-sm font-semibold text-black/65 hover:text-black"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

function PasswordField({
    id,
    label,
    value,
    onChange,
    isVisible,
    onToggle,
}: Readonly<{
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    isVisible: boolean;
    onToggle: () => void;
}>) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={isVisible ? "text" : "password"}
                    autoComplete="off"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-xl border border-black/15 p-3 pr-11 text-sm outline-none focus:border-[#0065A6] focus:ring-2 focus:ring-[#0065A6]/30"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute inset-y-0 right-0 px-3 text-black/50 hover:text-black"
                    aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
                >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}
