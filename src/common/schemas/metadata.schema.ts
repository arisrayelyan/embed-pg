import { z } from "zod";

export const metaDataSchema = z.record(
  z.union([z.string(), z.number(), z.boolean()])
);

export type MetaData = z.infer<typeof metaDataSchema>;
