import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  email: z.string().email("Enter a valid email address").max(200),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(150).optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
  // Honeypot field: real users never fill this in; bots often do.
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
