"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiRequest } from "@/lib/api";
import {
  verifyRegisterOtpSchema,
  type VerifyRegisterOtpInput,
} from "@/schemas/auth.schema";

export default function VerifyOtpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyRegisterOtpInput>({
    resolver: zodResolver(verifyRegisterOtpSchema),
    defaultValues: {
      phoneNumber: "",
      otp: "",
    },
  });

  useEffect(() => {
    const phoneNumber = localStorage.getItem("authPhoneNumber");

    if (!phoneNumber) {
      router.push("/login");
      return;
    }

    setValue("phoneNumber", phoneNumber);
  }, [router, setValue]);

  async function onSubmit(data: VerifyRegisterOtpInput) {
    try {
      const flow = localStorage.getItem("authFlow");

      const endpoint =
        flow === "register"
          ? "/auth/register/verify-otp"
          : "/auth/login/verify-otp";

      const res = await apiRequest(endpoint, data);

      if (res.accessToken || res.token) {
        localStorage.setItem("accessToken", res.accessToken || res.token);
      }

      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      localStorage.removeItem("authFlow");
      localStorage.removeItem("authPhoneNumber");

      router.push("/");
    } catch (error) {
      alert(error instanceof Error ? error.message : "OTP verification failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-20 max-w-md space-y-4"
    >
      <h1 className="text-2xl font-bold">Verify OTP</h1>

      <input
        {...register("phoneNumber")}
        placeholder="Phone number"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.phoneNumber?.message}</p>

      <input
        {...register("otp")}
        placeholder="Enter OTP"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.otp?.message}</p>

      <button
        disabled={isSubmitting}
        className="w-full rounded-md bg-black px-4 py-3 text-white"
      >
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );
}
