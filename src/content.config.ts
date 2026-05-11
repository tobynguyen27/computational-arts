import { file } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { artSchema } from './contents/schema'

const arts = defineCollection({
    loader: file('src/contents/arts.json'),
    schema: artSchema,
})

export const collections = { arts }
