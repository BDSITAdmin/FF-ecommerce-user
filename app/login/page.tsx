"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "@/public/assate/Layer_1 (1).svg";
import google from "@/public/assate/google-icon.png";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type LoginForm = {
  email: string;
  password: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function Login() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleLogin = async () => {
  if (!validateForm()) return;

  try {
    setErrors({});

    await login(form);
    router.push("/");
  } catch {
    setErrors({
      general: "Invalid email or password",
    });
  }
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <section className="bg-[#0065A4]">
      <div className="relative min-h-screen flex">

        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-center"
          style={{ backgroundImage: "url('/assate/login-bg.png')" }}
        />

        {/* LOGIN PANEL */}
        <div className="relative w-[60%] bg-white flex items-center justify-center">

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6"
          >

            {/* Logo */}
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
                Login to your account
              </h2>
            </div>

            {/* General Error */}
            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="e.g. Ramesh Kumar"
                  className="w-[472px] h-14 pl-12 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                />

              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">

              <div className="flex justify-between w-[472px] font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
                <label>Password</label>

                <Link
                  href="/forgot-password"
                  className="text-[#0065A6] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="********"
                  className="w-[472px] h-14 pl-12 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
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

            {/* Sign In */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-[472px] h-[60px] bg-[#0065A6] text-white text-[20px] font-semibold flex items-center justify-center rounded-full hover:bg-blue-800"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* Google Login */}
            <button
              type="button"
              className="w-[472px] h-14 border rounded-full flex items-center justify-center gap-2"
            >
              <Image src={google} alt="google" width={24} height={24} />
              Sign in with <span className="font-semibold">Google</span>
            </button>

            {/* Signup */}
            <p className="text-center font-[Figtree] font-semibold text-[16px] leading-4 tracking-[0.02em]">
              Don’t have an account?{" "}
              <Link href="/register" className="text-[#0065A6] underline">
                Sign up
              </Link>
            </p>

          </form>

        </div>
      </div>
    </section>
  );
}
