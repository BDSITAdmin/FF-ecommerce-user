"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import logo from "@/public/assate/Layer_1 (1).svg";
import google from "@/public/assate/google-icon.png";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ForgotPassword from "@/components/ForgotPassword";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: GoogleButtonConfiguration
  ) => void;
};

declare global {
  var google:
    | {
      accounts?: {
        id?: GoogleAccountsId;
      };
    }
    | undefined;

  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

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
  const { login, loginWithGoogle, isLoading } = useAuth();
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(googleClientId);

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const getLoginErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = error.response;

      if (
        typeof response === "object" &&
        response !== null &&
        "status" in response &&
        (response.status === 400 || response.status === 401)
      ) {
        return "Invalid email or password. Please try again.";
      }

      if (
        typeof response === "object" &&
        response !== null &&
        "data" in response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "message" in response.data &&
        typeof response.data.message === "string"
      ) {
        return response.data.message;
      }
    }

    if (error instanceof Error && error.message) {
      if (
        error.message.toLowerCase().includes("request failed with status code")
      ) {
        return "Invalid email or password. Please try again.";
      }

      return error.message;
    }

    return "Login failed. Please try again.";
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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
    } catch (error) {
      setErrors({
        general: getLoginErrorMessage(error),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleGoogleCredential = useEffectEvent(async (credential: string) => {
    try {
      setErrors({});
      await loginWithGoogle(credential);
      router.push("/");
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Google sign-in failed",
      });
    }
  });

  useEffect(() => {
    const googleAccountsId = globalThis.google?.accounts?.id;

    if (!isGoogleScriptLoaded || !googleClientId || !googleButtonRef.current || !googleAccountsId) {
      return;
    }

    googleButtonRef.current.innerHTML = "";

    googleAccountsId.initialize({
      client_id: googleClientId,
      callback: ({ credential }) => {
        if (!credential) {
          setErrors({
            general: "Google sign-in did not return a credential.",
          });
          return;
        }

        void handleGoogleCredential(credential);
      },
    });

    googleAccountsId.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
      width: googleButtonRef.current.offsetWidth,
    });
  }, [googleClientId, isGoogleScriptLoaded]);

  return (
    <section className="bg-white sm:bg-[#0065A4]">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsGoogleScriptLoaded(true)}
        onError={() => {
          setErrors({
            general: "Failed to load Google sign-in. Please try again.",
          });
        }}
      />
      <div className="relative flex flex-col lg:flex-row sm:min-h-screen">

        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-center lg:block hidden"
          style={{ backgroundImage: "url('/assate/login-bg.png')" }}
        />

        {/* LOGIN PANEL */}
        <div className="relative w-full lg:w-[60%] bg-white flex items-center justify-center px-4 sm:px-6 py-10">

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6 w-full"
          >

            {/* Logo */}
            <div className="text-center px-4 sm:px-6">
              {/* LOGO */}
              <div className="mx-auto w-30 sm:w-40 md:w-50">
                <Image
                  src={logo}
                  alt="logo"
                  width={200}
                  height={80}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* HEADING */}
              <h2 className="font-light mt-3 sm:mt-4 text-sm sm:text-xl md:text-[28px] text-gray-700">
                Login to your account
              </h2>
            </div>

            {/* General Error */}
            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2 w-full max-w-118">
              <label className="font-semibold text-sm sm:text-[16px]">
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
                  className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-lg border border-[#7697AC] focus:ring-2 focus:ring-[#7697AC] outline-none"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 w-full max-w-118">

              <div className="flex justify-between text-sm sm:text-[16px] font-semibold">
                <label>Password</label>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[#0065A6] hover:underline"
                >
                  Forgot password?
                </button>
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
                  className="w-full h-12 sm:h-14 pl-12 pr-12 rounded-lg border border-[#7697AC] focus:ring-2 focus:ring-[#7697AC] outline-none"
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
              className="w-full max-w-118 h-12 sm:h-15 bg-[#0065A6] text-white text-base sm:text-[20px] font-semibold sm:mt-3 flex items-center justify-center rounded-full hover:bg-[#023954] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* Google Login */}
            <div className="relative w-full max-w-118 h-12 sm:h-14">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  if (!isGoogleConfigured) {
                    setErrors({
                      general: "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.",
                    });
                  }
                }}
                className={`${isGoogleConfigured ? "pointer-events-none" : ""} w-full h-full border border-[#0065A6] rounded-full flex items-center justify-center gap-2 disabled:opacity-60`}
              >
                <Image src={google} alt="google" width={24} height={24} />
                Sign in with <span className="font-semibold">Google</span>
              </button>

              {isGoogleConfigured && (
                <div
                  ref={googleButtonRef}
                  className="absolute inset-0 z-10 overflow-hidden rounded-full opacity-0"
                />
              )}
            </div>

            {/* Signup */}
            <p className="text-center text-sm sm:text-[16px] font-semibold">
              Don’t have an account?{" "}
              <Link href="/register" className="text-[#0065A6] underline">
                Sign up
              </Link>
            </p>

          </form>

        </div>
      </div>

      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={form.email}
      />
    </section>
  );
}
