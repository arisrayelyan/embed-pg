/**
 * This file defines the schema for the "Product" collection, used for validation and type enforcement.
 * Feel free to adjust it according to your needs.
 */
import { z } from "zod";
import { metaDataSchema } from "./metadata.schema";
import { baseAddApiOutputSchema } from "./common.schema";

export const createProductInput = z.object({
  ids: z.array(z.string()),
  documents: z.array(z.string()),
  metadatas: z.array(metaDataSchema).optional(),
});

export const updateProductInput = z.object({
  key: z.string().uuid(),
  document: z.string().optional(),
  documentId: z.string().optional(),
  metadata: metaDataSchema.optional().nullish(),
});

export const deleteProductInput = z.object({
  key: z.string().uuid(),
  metadata: metaDataSchema.optional(),
});

export const searchProductInput = z.object({
  queryText: z.string(),
  nResults: z.number().default(5),
  metadata: metaDataSchema.optional(),
});

export const output = z.object({
  key: z.string().uuid(),
  documentId: z.string(),
  document: z.string().optional().nullish(),
  embedding: z.array(z.number()).max(1536).optional(),
  metadata: metaDataSchema.nullable().optional().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  score: z.number().optional(),
});

export const searchProductOutput = z.array(output).default([]);
export const createProductOutput = z
  .array(
    baseAddApiOutputSchema.extend({
      data: output,
    })
  )
  .default([]);
export const updateProductOutput = output;
export const deleteProductOutput = output.pick({ key: true });

export type SearchProductInput = z.infer<typeof searchProductInput>;
export type SearchProductOutput = z.infer<typeof searchProductOutput>;

export type CreateProductInput = z.infer<typeof createProductInput>;
export type CreateProductOutput = z.infer<typeof createProductOutput>;

export type UpdateProductInput = z.infer<typeof updateProductInput>;
export type UpdateProductOutput = z.infer<typeof updateProductOutput>;

export type DeleteProductInput = z.infer<typeof deleteProductInput>;
export type DeleteProductOutput = z.infer<typeof deleteProductOutput>;
