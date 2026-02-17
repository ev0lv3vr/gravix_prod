import { z } from 'zod';

// Failure Analysis Form Schema
export const failureAnalysisSchema = z.object({
  failureDescription: z
    .string()
    .min(20, 'Please provide at least 20 characters describing the failure'),
  adhesiveUsed: z.string().optional(),
  substrateA: z.string().min(1, 'Substrate A is required'),
  substrateB: z.string().min(1, 'Substrate B is required'),
  failureMode: z.string().min(1, 'Please select a failure mode'),
  timeToFailure: z.string().optional(),
  industry: z.string().optional(),
  environment: z.array(z.string()).optional().default([]),
  surfacePrep: z.string().optional(),
  productionImpact: z.string().optional(),
  additionalContext: z.string().optional(),
  // Sprint 11: AI-Forward fields
  productName: z.string().optional(),
  defectPhotos: z.array(z.string()).optional().default([]),
  investigationMode: z.enum(['quick', 'guided']).optional().default('quick'),
});

export type FailureAnalysisFormData = z.infer<typeof failureAnalysisSchema>;

// Spec Request Form Schema
export const specRequestSchema = z.object({
  substrateA: z.string().min(1, 'Substrate A is required'),
  substrateB: z.string().min(1, 'Substrate B is required'),
  bondType: z.string().optional(),
  expectedLoad: z.string().optional(),
  gapSize: z.string().optional(),
  tempMin: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    }),
  tempMax: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    }),
  chemicalExposure: z.string().optional(),
  uvExposure: z.boolean().optional(),
  cureMethod: z.string().optional(),
  productionVolume: z.string().optional(),
  applicationMethod: z.string().optional(),
  additionalContext: z.string().optional(),
}).refine((data) => {
  // If tempMin and tempMax are both provided, ensure tempMin < tempMax
  if (data.tempMin !== undefined && data.tempMax !== undefined) {
    return data.tempMin < data.tempMax;
  }
  return true;
}, {
  message: 'Minimum temperature must be less than maximum temperature',
  path: ['tempMin'],
});

export type SpecRequestFormData = z.infer<typeof specRequestSchema>;
