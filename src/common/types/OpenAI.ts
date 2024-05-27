export type Embedding = {
  object: string;
  index: number;
  embedding: number[];
};

export type ApiEmbeddingResponse = {
  object: string;
  data: Embedding[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
};
