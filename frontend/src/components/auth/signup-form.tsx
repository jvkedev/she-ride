"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiRequest } from "@/lib/api";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "FEMALE",
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      await apiRequest("/auth/register/send-otp", data);

      localStorage.setItem("authFlow", "register");
      localStorage.setItem("authPhoneNumber", data.phoneNumber);

      router.push("/verify-otp");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Register failed");
    }
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-20 max-w-md space-y-4"
    >
      <h1 className="text-2xl font-bold">Create Account</h1>

      <input
        {...register("fullName")}
        placeholder="Full name"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.fullName?.message}</p>

      <input
        {...register("email")}
        placeholder="Email"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.email?.message}</p>

      <input
        {...register("phoneNumber")}
        placeholder="Phone number"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.phoneNumber?.message}</p>

      <input
        type="password"
        {...register("password")}
        placeholder="Password"
        className="w-full rounded-md border px-4 py-3"
      />
      <p className="text-sm text-red-500">{errors.password?.message}</p>

      <button
        disabled={isSubmitting}
        className="w-full rounded-md bg-black px-4 py-3 text-white"
      >
        {isSubmitting ? "Sending OTP..." : "Register"}
      </button>
    </form>
  );
}
