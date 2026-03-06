"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

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

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
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
      await login(form, rememberMe);
      router.push("/"); // Redirect to homepage after successful login
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid email or password. Please try again.";
      setErrors({
        general: message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-green-100 bg-white">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-600 to-green-700 p-10 text-white">
          <div>
            <p className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
              User Login
            </p>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight">
              Welcome Back to Your Shopping Space
            </h2>
            <p className="mt-4 text-emerald-100 text-base">
              Sign in to view your orders, manage your cart, and continue shopping.
            </p>
          </div>

          <div className="relative mt-8 flex justify-center">
            <Image
              src="/assate/home-image-removebg-preview.png"
              alt="User login illustration"
              width={420}
              height={420}
              className="w-full max-w-sm h-auto drop-shadow-2xl"
              priority
            />
          </div>

          <p className="text-sm text-emerald-100">
            Secure access for registered users.
          </p>
        </div>

        <div className="p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-green-100 shadow-lg p-8">
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.general}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline transition duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold 
              ${isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-emerald-700 hover:shadow-lg transform hover:scale-[1.02]'
              } transition-all duration-200 flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline transition duration-200"
            >
              Sign up
            </Link>
          </p>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-emerald-600 hover:underline font-medium">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">
            Privacy Policy
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
