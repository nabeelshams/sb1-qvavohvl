// Validator.ts

import { z } from 'zod';

export const jobDetailsSchema = z.object({
    jobId: z.string(),
    jobTitle: z.string().nonempty(),
    companyName: z.string().nonempty(),
    location: z.string().nonempty(),
    salary: z.string().nullable(),
    jobDescription: z.string().nullable(),
    postingDate: z.string()
});

export type JobDetails = z.infer<typeof jobDetailsSchema>;

export interface ScrapedJobs {
    jobs: JobDetails[];
}
