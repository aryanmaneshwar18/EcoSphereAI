import { z } from "zod";

export const activitySchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Must be a positive number"),
  activity_date: z.string().min(1, "Date is required"),
  notes: z.string().optional()
});

export type ActivityFormData = z.infer<typeof activitySchema>;

export const onboardingSchema = z.object({
  diet: z.string().min(1, "Diet is required"),
  transport: z.string().min(1, "Transport is required"),
  energy: z.string().min(1, "Energy is required"),
  home: z.string().min(1, "Household size is required"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
