"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, X } from "lucide-react";
import {
    resetPassword,
    sendResetOtp,
    verifyResetOtp,
} from "@/services/auth.service";

type ForgotPasswordProps = {
    isOpen: boolean;
    onClose: () => void;
    defaultEmail?: string;
};

type Step = "email" | "otp" | "password" | "success";

const isValidEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

const isResponseObject = (value: unknown): value is {
    status?: number;
    data?: { message?: string };
} => typeof value === "object" && value !== null;

const getResponseMessage = (response: unknown): string | null => {
    if (!isResponseObject(response)) return null;
    const maybeMessage = response.data?.message;
    return typeof maybeMessage === "string" ? maybeMessage.trim() : null;
};

const isGeneric400Message = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return (
        lowerMessage.includes("request failed with status code") ||
        lowerMessage.includes("bad request") ||
        lowerMessage === ""
    );
};

export default function ForgotPassword({
    isOpen,
    onClose,
    defaultEmail,
}: Readonly<ForgotPasswordProps>) {
    const [email, setEmail] = useState(defaultEmail ?? "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<Step>("email");

    useEffect(() => {
        if (!isOpen) return;
        setEmail(defaultEmail ?? "");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setStep("email");
    }, [defaultEmail, isOpen]);

    if (!isOpen) return null;

    const normalizedEmail = email.trim();

    const getErrorMessage = (
        submitError: unknown,
        fallbackMessage: string,
        otpFallbackMessage?: string
    ) => {
        if (typeof submitError === "object" && submitError !== null && "response" in submitError) {
            const response = submitError.response;
            const responseMessage = getResponseMessage(response);

            if (
                otpFallbackMessage &&
                isResponseObject(response) &&
                response.status === 400
            ) {
                if (!responseMessage || isGeneric400Message(responseMessage)) {
                    return otpFallbackMessage;
                }
                return responseMessage;
            }

            if (responseMessage) {
                return responseMessage;
            }
        }

        if (submitError instanceof Error && submitError.message) {
            if (
                otpFallbackMessage &&
                submitError.message.toLowerCase().includes("request failed with status code 400")
            ) {
                return otpFallbackMessage;
            }

            return submitError.message;
        }

        return fallbackMessage;
    };

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!normalizedEmail) {
            setError("Email is required");
            return;
        }

        if (!isValidEmail(normalizedEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setError("");
            setIsSubmitting(true);

            await sendResetOtp(normalizedEmail);
            setStep("otp");
        } catch (submitError) {
            setError(getErrorMessage(submitError, "Unable to send OTP. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!normalizedEmail) {
            setStep("email");
            setError("Email is required");
            return;
        }

        if (!/^\d{6}$/.test(otp.trim())) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setError("");
            setIsSubmitting(true);

            await verifyResetOtp(normalizedEmail, otp.trim());
            setStep("password");
        } catch (submitError) {
            setError(
                getErrorMessage(
                    submitError,
                    "OTP verification failed. Please try again.",
                    "Invalid OTP. Please enter the correct OTP."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setError("");
            setIsSubmitting(true);

            await resetPassword(normalizedEmail, otp.trim(), newPassword);
            setStep("success");
        } catch (submitError) {
            setError(
                getErrorMessage(
                    submitError,
                    "Unable to reset password. Please try again.",
                    "Invalid OTP. Please verify OTP and try again."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        if (step === "success") {
            return (
                <div className="space-y-5">
                    <p className="text-sm text-gray-700">
                        Password updated successfully for <span className="font-semibold">{normalizedEmail}</span>.
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-full bg-[#0065A6] text-sm font-semibold text-white transition-colors hover:bg-[#023954]"
                    >
                        Back to Login
                    </button>
                </div>
            );
        }

        if (step === "otp") {
            return (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Enter the 6-digit OTP sent to <span className="font-semibold">{normalizedEmail}</span>.
                    </p>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">OTP</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replaceAll(/\D/g, ""))}
                            placeholder="123456"
                            className="h-12 w-full rounded-lg border border-[#7697AC] px-4 outline-none focus:ring-2 focus:ring-[#7697AC]"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setStep("email");
                            }}
                            className="h-11 w-1/2 rounded-full border border-[#0065A6] text-sm font-semibold text-[#0065A6] transition-colors hover:bg-blue-50"
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 w-1/2 rounded-full bg-[#0065A6] text-sm font-semibold text-white transition-colors hover:bg-[#023954] disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Verifying..." : "Verify OTP"}
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={async () => {
                            try {
                                setError("");
                                setIsSubmitting(true);
                                await sendResetOtp(normalizedEmail);
                            } catch (submitError) {
                                setError(getErrorMessage(submitError, "Unable to resend OTP. Please try again."));
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        className="text-sm font-semibold text-[#0065A6] underline disabled:text-gray-400"
                    >
                        Resend OTP
                    </button>
                </form>
            );
        }

        if (step === "password") {
            return (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Set a new password for <span className="font-semibold">{normalizedEmail}</span>.
                    </p>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="h-12 w-full rounded-lg border border-[#7697AC] pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#7697AC]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="h-12 w-full rounded-lg border border-[#7697AC] pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#7697AC]"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setStep("otp");
                            }}
                            className="h-11 w-1/2 rounded-full border border-[#0065A6] text-sm font-semibold text-[#0065A6] transition-colors hover:bg-blue-50"
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 w-1/2 rounded-full bg-[#0065A6] text-sm font-semibold text-white transition-colors hover:bg-[#023954] disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Updating..." : "Reset Password"}
                        </button>
                    </div>
                </form>
            );
        }

        return (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">
                    Enter your account email and we will send you an OTP to reset your password.
                </p>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. ramesh@example.com"
                            className="h-12 w-full rounded-lg border border-[#7697AC] pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#7697AC]"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-1/2 rounded-full border border-[#0065A6] text-sm font-semibold text-[#0065A6] transition-colors hover:bg-blue-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 w-1/2 rounded-full bg-[#0065A6] text-sm font-semibold text-white transition-colors hover:bg-[#023954] disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {isSubmitting ? "Sending..." : "Send OTP"}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-7">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">Forgot Password</h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close forgot password modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0065A6]">
                    <span className={step === "email" ? "text-[#0065A6]" : "text-gray-400"}>Email</span>
                    <span className="text-gray-300">/</span>
                    <span className={step === "otp" ? "text-[#0065A6]" : "text-gray-400"}>OTP</span>
                    <span className="text-gray-300">/</span>
                    <span className={step === "password" ? "text-[#0065A6]" : "text-gray-400"}>Password</span>
                </div>

                {renderStepContent()}
            </div>
        </div>
    );
}
