import { EntityManager, EntityRepository, raw } from "@mikro-orm/postgresql";
import { Product } from "@database/entities";
import { BaseQuery } from "@common/schemas/common.schema";
import {
  CreateProductInput,
  CreateProductOutput,
  DeleteProductInput,
  DeleteProductOutput,
  SearchProductInput,
  SearchProductOutput,
  UpdateProductInput,
  UpdateProductOutput,
} from "@common/schemas/product.schema";
import logger from "@utils/logger";
import BaseService from "./BaseService";

export class ProductService extends BaseService {
  private em: EntityManager;
  private repository: EntityRepository<Product>;
  private serviceLogger = logger.child({ service: "ProductService" });

  constructor({ em }: { em: EntityManager }) {
    super();
    this.em = em;
    this.repository = this.em.getRepository(Product);
  }
  /**
   * Add new product data
   * @param params CreateProductInput
   * @param query BaseQuery
   * @returns CreateProductOutput
   */
  async add(
    params: CreateProductInput,
    query: BaseQuery
  ): Promise<CreateProductOutput> {
    const { ids, documents, metadatas } = params;
    const { returnEmbeddings } = query;
    const isEmbeddingRequested: boolean = returnEmbeddings === "yes";
    const apiErrors: Record<string, string> = {};

    // check if ids and documents length are equal
    if (ids.length !== documents.length) {
      throw new Error("Ids and documents length should be equal");
    }

    await Promise.all(
      ids.map(async (id, index) => {
        const document = documents[index];
        const metadata = metadatas?.[index] || null;
        const embeddingResponse = await this.requestEmbedding(document);
        if (!embeddingResponse.success) {
          apiErrors[id] = embeddingResponse.error || "Unknown error";
        }
        if (embeddingResponse.success) {
          this.repository.create({
            documentId: id,
            document,
            metadata,
            embedding: embeddingResponse.embedding,
          });
        }
        return;
      })
    );

    try {
      await this.em.flush();
      const result = await this.repository.find(
        {
          documentId: { $in: ids },
        },
        {
          ...(!isEmbeddingRequested
            ? {
                fields: [
                  "key",
                  "documentId",
                  "document",
                  "metadata",
                  "createdAt",
                  "updatedAt",
                ],
              }
            : {}),
        }
      );
      return (
        result
          .map((item) => ({
            success: !apiErrors?.[item.documentId],
            error: apiErrors?.[item.documentId] || undefined,
            data: {
              key: item.key,
              documentId: item.documentId,
              document: item.document,
              metadata: item.metadata,
              ...(isEmbeddingRequested && "embedding" in item
                ? { embedding: item.embedding as number[] }
                : {}),
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            },
          }))
          // order by given ids
          .sort((a, b) => {
            return (
              ids.indexOf(a.data.documentId) - ids.indexOf(b.data.documentId)
            );
          })
      );
    } catch (error) {
      this.serviceLogger.error({
        message: "Failed to save data",
        error,
      });
      throw new Error("Failed to save data");
    }
  }

  /**
   * Update product data
   * @param data UpdateProductInput
   * @returns UpdateProductOutput
   */
  async update(data: UpdateProductInput): Promise<UpdateProductOutput> {
    const { key, document, metadata, documentId } = data;
    const doc = await this.get(key);
    if (document && document !== doc.document) {
      const embeddingResponse = await this.requestEmbedding(document);
      if (embeddingResponse.success) {
        this.serviceLogger.info("Successfully updated document embedding");
        doc.embedding = embeddingResponse.embedding;
        doc.document = document;
      } else {
        this.serviceLogger.error({
          message: "Failed to update document embedding",
          error: embeddingResponse.error,
        });
        throw new Error("Failed to update document embedding");
      }
    }
    if (metadata && metadata === null) {
      doc.metadata = metadata;
    }
    if (documentId && documentId !== doc.documentId) {
      doc.documentId = documentId;
    }
    doc.updatedAt = new Date();
    try {
      await this.em.flush();
      return doc;
    } catch (error) {
      this.serviceLogger.error({
        message: "Failed to update data",
        error,
      });
      throw new Error("Failed to update data");
    }
  }

  /**
   * Delete product data
   * @param data DeleteProductInput
   * @returns DeleteProductOutput
   */
  async delete(data: DeleteProductInput): Promise<DeleteProductOutput> {
    const { key, metadata } = data;
    const doc = await this.repository.findOneOrFail({
      key,
      ...(metadata ? { metadata } : {}),
    });
    try {
      this.em.remove(doc);
      await this.em.flush();
      return {
        key,
      };
    } catch (error) {
      this.serviceLogger.error({
        message: "Failed to delete data",
        error,
      });
      throw new Error("Failed to delete data");
    }
  }

  /**
   * Search product data with cosine similarity
   * @param data SearchProductInput
   * @returns  SearchProductOutput
   */
  async search(data: SearchProductInput): Promise<SearchProductOutput> {
    const { queryText, nResults, metadata } = data;
    const embeddingResponse = await this.requestEmbedding(queryText);
    if (!embeddingResponse.success) {
      throw new Error(embeddingResponse.error || "Unknown error");
    }
    const embedding = embeddingResponse.embedding;
    const embeddingForQuery = JSON.stringify(embedding);
    const qb = this.repository.createQueryBuilder("q");
    qb.select("*");
    qb.addSelect(
      raw(`1 - ("q"."embedding" <=> :embedding) as score`, {
        embedding: embeddingForQuery,
      })
    );

    if (metadata) {
      qb.where({ metadata });
    }

    qb.orderBy({
      [raw(`embedding <-> :embedding`, { embedding: embeddingForQuery })]: "",
    });
    qb.limit(nResults);
    const result = await qb.execute<
      (Product & {
        score: number;
      })[]
    >();
    return result.map((item) => {
      const { embedding: _embedding, score, ...rest } = item;
      return {
        ...rest,
        score,
      };
    });
  }

  /**
   * Get product data
   * @param key string
   * @returns Product
   */
  async get(key: string) {
    return this.repository.findOneOrFail({ key });
  }
}
