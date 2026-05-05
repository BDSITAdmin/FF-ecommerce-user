"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/assate/Layer_1 (1).svg";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Check, X } from "lucide-react";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user";
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name Validation
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Last Name Validation
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Email Validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password Validation (must match backend requirements)
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
      newErrors.password = "Password must contain at least one special character (@, #, $, etc.)";
    }

    // Confirm Password Validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});
      await api.post(
        "/api/v1/auth/register",
        {
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          confirmPassword: form.confirmPassword,
          role: "user",
        }
      );
      router.push("/login");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as any).response?.data?.message === "string"
          ? (error as any).response.data.message
          : "Registration failed. Please check details and try again.";
      setErrors({
        general: message,
      });
    } finally {
      setIsLoading(false);
    }
    console.log("API HIT");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleRegister();
  };

  return (
    <section className="bg-[#0065A4]">
      <div className="relative min-h-screen flex flex-col lg:flex-row">

        {/* BACKGROUND IMAGE (hide on mobile) */}
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-center hidden lg:block"
          style={{ backgroundImage: "url('/assate/login-bg.png')" }}
        />

        {/* FORM PANEL */}
        <div className="relative w-full lg:w-[60%] bg-white flex items-center justify-center px-4 sm:px-6 py-10">

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full">

            {/* LOGO */}
            <div className="text-center">
              <Image
                src={logo}
                alt="logo"
                width={200}
                height={80}
                priority
                className="mx-auto object-contain"
              />
              <h2 className="text-lg sm:text-xl font-semibold mt-4 text-gray-700">
                Create your account
              </h2>
            </div>

            {/* ERROR */}
            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}

            {/* NAME FIELDS */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[472px]">

              {/* FIRST NAME */}
              <div className="flex flex-col gap-2 w-full sm:w-1/2">
                <label className="font-semibold text-sm sm:text-[16px]">
                  First Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isLoading}
                  />
                </div>

                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName}</p>
                )}
              </div>

              {/* LAST NAME */}
              <div className="flex flex-col gap-2 w-full sm:w-1/2">
                <label className="font-semibold text-sm sm:text-[16px]">
                  Last Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isLoading}
                  />
                </div>

                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName}</p>
                )}
              </div>

            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-2 w-full max-w-[472px]">
              <label className="font-semibold text-sm sm:text-[16px]">Email</label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isLoading}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-2 w-full max-w-[472px]">
              <label className="font-semibold text-sm sm:text-[16px]">Password</label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="********"
                  className="w-full h-12 sm:h-14 pl-12 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col gap-2 w-full max-w-[472px]">
              <label className="font-semibold text-sm sm:text-[16px]">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="********"
                  className="w-full h-12 sm:h-14 pl-12 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-[472px] h-12 sm:h-[60px] bg-[#0065A6] text-white text-base sm:text-[20px] font-semibold rounded-full flex items-center justify-center course-in-out duration-300 hover:bg-[#005080] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-sm sm:text-[16px] font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0065A6] underline">
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </section>
  );
}
