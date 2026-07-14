import { describe, it, expect } from "vitest";
import { enquirySchema } from "@/lib/validation/enquiry";

describe("enquirySchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    message: "I'd like to talk about a project.",
  };

  it("accepts a valid minimal submission", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing name", () => {
    const { name, ...rest } = valid;
    void name;
    expect(enquirySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an invalid email address", () => {
    const result = enquirySchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    const result = enquirySchema.safeParse({ ...valid, message: "short" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty honeypot field", () => {
    const result = enquirySchema.safeParse({ ...valid, website: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a filled-in honeypot field (bot signal)", () => {
    const result = enquirySchema.safeParse({ ...valid, website: "http://spam.example" });
    expect(result.success).toBe(false);
  });
});
