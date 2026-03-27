"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/assate/Layer_1 (1).svg";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";

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

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleRegister();
  };

  return (
    <section className="bg-[#0065A4]">
      <div className="relative min-h-screen flex">
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-center"
          style={{ backgroundImage: "url('/assate/login-bg.png')" }}
        />

        <div className="relative w-[60%] bg-white flex items-center justify-center">
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
            <div className="text-center">
              <Image
                src={logo}
                alt="logo"
                width={200}
                height={80}
                priority
                className="mx-auto object-contain"
              />
              <h2 className="text-xl font-semibold mt-4 text-gray-700">
                Create your account
              </h2>
            </div>

            {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

            <div className="flex gap-4 w-[472px]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
              </div>

              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-[472px] h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="********"
                  className="w-[472px] h-14 pl-12 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
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
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="********"
                  className="w-[472px] h-14 pl-12 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-[472px] h-[60px] bg-[#0065A6] text-white text-[20px] font-semibold flex items-center justify-center rounded-full hover:bg-blue-800"
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

            <p className="text-center font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
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
