import { z } from 'astro/zod'

export const artSchema = z.object({
    name: z.string(),
    description: z.string(),
})

export type ArtSchema = z.infer<typeof artSchema>
