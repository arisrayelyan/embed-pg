import { Entity, Index, OptionalProps, Property } from "@mikro-orm/core";
import { BaseEntity, BaseEntityOptionalProps } from "./BaseEntity";
import { VectorType } from "@database/VectorType";
import { MetaData } from "@common/schemas/metadata.schema";

@Entity()
export class Product extends BaseEntity {
  [OptionalProps]?: BaseEntityOptionalProps;

  @Property({ type: VectorType, length: 1536 })
  @Index({
    name: "product_embedding_idx",
    expression:
      'CREATE INDEX ON "product" USING hnsw (embedding vector_cosine_ops)',
  })
  embedding: number[];

  @Property({ nullable: false })
  @Index()
  documentId: string;

  @Property({ nullable: false, type: "text" })
  document: string;

  @Property({ nullable: true, type: "jsonb" })
  @Index({ properties: ["metadata.color"] })
  metadata?: MetaData | null;
}
