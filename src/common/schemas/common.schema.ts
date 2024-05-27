import { z } from "zod";
import { metaDataSchema } from "./metadata.schema";

// Defines a schema for an array of numbers, typically used for embeddings.
export const embeddingSchema = z.array(z.number());

// Base schema for add operations, including common fields.
export const baseAddSchema = z.object({
  ids: z.array(z.string()), // An array of identifiers.
  metadatas: z.array(metaDataSchema).optional(), // Optional array of metadata, following the metaDataSchema.
});

// Schema for add operations with embedding vectors.
export const AddWithEmbeddingsSchema = baseAddSchema.extend({
  embeddings: z.array(embeddingSchema), // An array of embeddings.
});

// Schema for add operations with documents.
export const AddWithDocumentsSchema = baseAddSchema.extend({
  documents: z.array(z.string()), // An array of document strings.
});

// Schema for the structured format of incoming data.
export const formattedDataSchema = z.array(
  z.object({
    id: z.string(), // Identifier of the data.
    content: z.union([z.string(), embeddingSchema]), // Content can be either a string or an array of numbers.
    metadata: metaDataSchema.optional(), // Optional metadata associated with the data.
  })
);

// Union schema to accept either document-based or embedding-based additions.
export const AddInputSchema = z.union([
  AddWithDocumentsSchema,
  AddWithEmbeddingsSchema,
]);

// Base schema for queries, including common fields.
export const baseQuerySchema = z.object({
  returnEmbeddings: z.enum(["yes", "no"]).default("no"),
});

// Base schema for get operations, including common fields.
export const baseGetQuerySchema = z.object({
  key: z.string().uuid(), // Identifier of the data.
});

export const baseAddApiOutputSchema = z.object({
  success: z.boolean(), // Indicates whether the operation was successful.
  error: z.string().optional(), // Optional error message.
});

// Type aliases derived from the schemas, providing a shorthand for referring to their inferred types.
export type AddInput = z.infer<typeof AddInputSchema>;
export type AddWithDocuments = z.infer<typeof AddWithDocumentsSchema>;
export type AddWithEmbeddings = z.infer<typeof AddWithEmbeddingsSchema>;
export type FormattedDataOutput = z.infer<typeof formattedDataSchema>;
export type BaseQuery = z.infer<typeof baseQuerySchema>;
export type BaseAddApiOutput = z.infer<typeof baseAddApiOutputSchema>;
export type BaseGetQuery = z.infer<typeof baseGetQuerySchema>;
