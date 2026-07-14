import { describe, it, expect } from "vitest";
import { buildSubmissionSchema, type FormField } from "@/lib/validation/forms";

describe("buildSubmissionSchema", () => {
  const fields: FormField[] = [
    { name: "fullName", label: "Full name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "yearsExperience", label: "Years of experience", type: "number", required: false },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: ["Engineer", "Designer", "PM"],
    },
    { name: "subscribe", label: "Subscribe to updates", type: "checkbox", required: false },
  ];

  it("accepts a submission with all required fields present", () => {
    const schema = buildSubmissionSchema(fields);
    const result = schema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "Engineer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a submission missing a required field", () => {
    const schema = buildSubmissionSchema(fields);
    const result = schema.safeParse({ fullName: "Jane Doe" });
    expect(result.success).toBe(false);
  });

  it("rejects an email field with an invalid address", () => {
    const schema = buildSubmissionSchema(fields);
    const result = schema.safeParse({
      fullName: "Jane Doe",
      email: "not-an-email",
      role: "Engineer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a select field value outside its configured options", () => {
    const schema = buildSubmissionSchema(fields);
    const result = schema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "CEO", // not one of the configured options
    });
    expect(result.success).toBe(false);
  });

  it("coerces a numeric string field to a number", () => {
    const schema = buildSubmissionSchema(fields);
    const result = schema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "Engineer",
      yearsExperience: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.yearsExperience).toBe(5);
    }
  });

  it("rejects a filled-in honeypot field regardless of form-specific fields", () => {
    const schema = buildSubmissionSchema(fields);
    const result = schema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "Engineer",
      website: "http://spam.example",
    });
    expect(result.success).toBe(false);
  });
});
