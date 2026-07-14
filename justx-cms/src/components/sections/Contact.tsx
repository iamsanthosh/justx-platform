"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, type EnquiryInput } from "@/lib/validation/enquiry";
import type { ContactContent } from "@/types/content";

export default function Contact({ content }: { content: ContactContent }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput>({ resolver: zodResolver(enquirySchema) });

  async function onSubmit(data: EnquiryInput) {
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl text-ink md:text-4xl">{content.heading}</h2>
          {content.subheading && <p className="mt-4 text-body">{content.subheading}</p>}
          <div className="mt-6 space-y-1 text-sm text-body">
            {content.email && <p>{content.email}</p>}
            {content.phone && <p>{content.phone}</p>}
            {content.address && <p>{content.address}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Honeypot field: hidden from real users, bots often fill it in. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            {...register("website")}
          />

          <div>
            <input
              {...register("name")}
              placeholder="Name"
              className="w-full rounded border border-border px-4 py-3 text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <input
              {...register("email")}
              placeholder="Email"
              className="w-full rounded border border-border px-4 py-3 text-sm"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <input
            {...register("phone")}
            placeholder="Phone (optional)"
            className="w-full rounded border border-border px-4 py-3 text-sm"
          />

          <input
            {...register("company")}
            placeholder="Company (optional)"
            className="w-full rounded border border-border px-4 py-3 text-sm"
          />

          <div>
            <textarea
              {...register("message")}
              placeholder="Message"
              rows={4}
              className="w-full rounded border border-border px-4 py-3 text-sm"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded bg-ink px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send message"}
          </button>

          {status === "sent" && (
            <p className="text-sm text-green-700">Thanks — we&apos;ll be in touch shortly.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  );
}
