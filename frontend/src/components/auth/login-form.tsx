"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiRequest } from "@/lib/api";
import {
  sendLoginOtpSchema,
  type SendLoginOtpInput,
} from "@/schemas/auth.schema";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SendLoginOtpInput>({
    resolver: zodResolver(sendLoginOtpSchema),
  });

  async function onSubmit(data: SendLoginOtpInput) {
    try {
      await apiRequest("/auth/login/send-otp", data);
      localStorage.setItem("authFlow", "login");
      localStorage.setItem("authPhoneNumber", data.phoneNumber);
      router.push("/verify-otp");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Login failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-20 max-w-md space-y-4"
    >
      <h1 className="text-2xl font-bold">Login</h1>

      {/* ── Blocked account message ── */}
      {reason === "blocked" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Your account has been blocked. Please contact support.
        </div>
      )}

      {reason === "session_expired" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Your session has expired. Please log in again.
        </div>
      )}

      <input
        {...register("phoneNumber")}
        placeholder="Phone number"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.phoneNumber?.message}</p>

      <button
        disabled={isSubmitting}
        className="w-full rounded-md bg-black px-4 py-3 text-white"
      >
        {isSubmitting ? "Sending OTP..." : "Send OTP"}
      </button>
    </form>
  );
}
