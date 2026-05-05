"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type PasswordForm = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export default function ChangePasswordModal() {
    const { changePasswordAction, isLoading } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
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
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setError("");
        setSuccess("");
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
    }, [isOpen]);

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
            setTimeout(() => {
                setIsOpen(false);
            }, 800);
        } catch (err: any) {
            setError(err?.message || "Unable to change password.");
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50"
            >
                <KeyRound size={16} />
                Change Password
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        type="button"
                        aria-label="Close change password modal"
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-xl rounded-2xl border border-black/10 bg-white p-5 shadow-2xl sm:p-6 max-h-[90vh] overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-semibold text-black">Change Password</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/70 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-5">
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

                            <div className="pt-1 flex items-center gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0065A6] hover:bg-[#00558d] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <KeyRound size={16} />
                                    {isLoading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
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
