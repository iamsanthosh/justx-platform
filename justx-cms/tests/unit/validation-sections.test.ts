import { describe, it, expect } from "vitest";
import { validateSectionContent } from "@/lib/validation/sections";

describe("validateSectionContent", () => {
  it("accepts a well-formed HERO section", () => {
    const result = validateSectionContent("HERO", {
      headline: "Engineering the next generation of intelligent digital business.",
      primaryCtaLabel: "Start a project",
      primaryCtaHref: "/#contact",
      images: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a HERO section missing the required headline", () => {
    const result = validateSectionContent("HERO", { subhead: "No headline here" });
    expect(result.success).toBe(false);
  });

  it("rejects a HERO headline that exceeds the max length", () => {
    const result = validateSectionContent("HERO", { headline: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("accepts a METRICS section with well-formed items", () => {
    const result = validateSectionContent("METRICS", {
      items: [
        { value: "20+", label: "Years of experience" },
        { value: "500+", label: "Hours delivered" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects METRICS with more than 8 items (the schema's max)", () => {
    const items = Array.from({ length: 9 }, (_, i) => ({ value: String(i), label: "x" }));
    const result = validateSectionContent("METRICS", { items });
    expect(result.success).toBe(false);
  });

  it("rejects CONTACT content missing the required heading", () => {
    const result = validateSectionContent("CONTACT", { email: "hello@justxsystems.com" });
    expect(result.success).toBe(false);
  });

  it("defaults CONTACT.formKey to 'primary-contact' when omitted", () => {
    const result = validateSectionContent("CONTACT", { heading: "Get in touch" });
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data as { formKey: string };
      expect(data.formKey).toBe("primary-contact");
    }
  });

  it("rejects a CONTACT email field that isn't a valid email address", () => {
    const result = validateSectionContent("CONTACT", {
      heading: "Get in touch",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown section type shape (wrong content for FAQ)", () => {
    // FAQ items need `question`/`answer`; this shape belongs to SERVICES instead.
    const result = validateSectionContent("FAQ", {
      items: [{ title: "Wrong shape", description: "Not a question/answer pair" }],
    });
    expect(result.success).toBe(false);
  });
});
