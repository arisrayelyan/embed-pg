import axios from "axios";
import env from "@settings/env";
import logger from "@utils/logger";
import { ApiEmbeddingResponse } from "@common/types/OpenAI";
import { FormattedDataOutput, AddInput } from "@common/schemas/common.schema";

class BaseService {
  private apiEndpoint?: string = env.OPEN_AI_API_ENDPOINT;
  private model?: string = env.OPEN_AI_MODEL;
  private apiKey?: string = env.OPENAI_API_KEY;
  private logger = logger.child({ service: "BaseService" });

  constructor() {}

  get client() {
    if (!this.apiEndpoint || !this.apiKey) {
      throw new Error("API endpoint and key are required.");
    }
    return axios.create({
      baseURL: this.apiEndpoint,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async requestEmbedding(text: string): Promise<{
    success: boolean;
    error?: string;
    embedding: number[];
  }> {
    if (!text) {
      return {
        success: false,
        error: "Text is required",
        embedding: [],
      };
    }

    try {
      const { data } = await this.client.post<ApiEmbeddingResponse>(
        "/embeddings",
        {
          input: text.trim(),
          model: this.model,
        }
      );
      return {
        success: true,
        embedding: data.data?.[0]?.embedding || [],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error("error message", error.response?.data);
        return {
          success: false,
          error: error.response?.data?.error?.message,
          embedding: [],
        };
      } else {
        this.logger.error("unexpected error: ", error);
        return {
          success: false,
          error: "Unexpected error.",
          embedding: [],
        };
      }
    }
  }

  formatIncomingData(data: AddInput): FormattedDataOutput {
    const { ids, metadatas } = data;
    let contents: (string | number[])[] = [];
    if ("documents" in data) {
      contents = data.documents;
    } else if ("embeddings" in data) {
      contents = data.embeddings;
    }
    if (!contents || !contents.length) {
      return [];
    }

    return ids
      .map((id: string, index: number) => ({
        id,
        content: contents[index],
        ...(metadatas?.length
          ? {
              metadata: metadatas?.[index] || undefined,
            }
          : { metadata: undefined }),
      }))
      .filter((item) => item.id && item.content);
  }
}

export default BaseService;
