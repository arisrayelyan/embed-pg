# EmbedPG API Documentation

The routers are dynamic and can be generated as needed. Below is the general structure and usage of the API endpoints.

## Authentication
All requests to the EmbedPG API must include an `Authorization` header with a valid Bearer token. You can generate a new API token by running the `pnpm generate:token` command.

Example:
```
Authorization: Bearer <token>
```


## Endpoints
Endpoints available depends on the generated collections and all instruction below is common to all endpoints. There is only one difference between the endpoints and that is the body of the request. When collection is using external embedding you should replace the `documents` with the `embeddings` in the request body.

## Create
This endpoint is used to create a multiple records in a collection.

### POST /{collection_name}

#### Request Body
```json
{
    "ids": [
        "1"
    ],
    "documents": [
        "document" # your document that must be embedded
    ],
    "metadatas": [
        {
            "key": 1
        }
    ]
}
```

#### Request body type
```typescript
type CreateRequest = {
    ids: string[];
    documents: string[];
    metadatas?: {[key: string]: string | number | boolean}[];
}
```

1. `ids` - An array of ids associated with the document.
2. `documents|embeddings` - An array of documents|embeddings to be created.
3. `metadatas` - An array of metadata associated with the document. Metadata is optional and can be empty.

### Response
- 200 OK
```json
[{
    "success": true,
    "data": {
        "key": "7e03b8e6-5049-4842-b574-e2aa264a5de3",
        "documentId": "1",
        "document": "Document 1",
        "metadata": {
            "isCurrent": true
        },
        "createdAt": "2024-05-26T19:10:12.880Z",
        "updatedAt": "2024-05-26T19:10:12.880Z"
    }
}],
```

#### Response body type
```typescript
type CreateResponse = {
    success: boolean;
    data: {
        key: string;
        documentId: string;
        document: string;
        metadata: {[key: string]: string | number | boolean};
        createdAt: string;
        updatedAt: string;
    }
}[]
```

**You can add `returnEmbeddings=yes` query parameter to return the embeddings in the response.**

## Update

### PUT /{collection_name}/:key

#### Request Body
```json
{
    "document": "document",
    "documentId": "1",
    "metadata": {
        "key": 1,
        // other metadata fields
    }
}
```

#### Request body type
```typescript
type UpdateRequest = {
    document?: string;
    documentId?: string;
    metadata?: {[key: string]: string | number | boolean};
}
```

Response is the same as the create response.

## Delete

### DELETE /{collection_name}/:key

#### Response
- 200 OK
```json
{
    "key": "key",
}
```
## Search
Depends on generated collections your search query can be different. Below is the general structure of the search query.

### POST /{collection_name}/search

#### Request Body
```json
{
    "queryText": "query",
    "nResults": 10,
    "metadata": {
        "key": 1
    }
}
```

1. `queryText` - A query string to search for. In case of external embedding, replace `queryText` with your `embeddings`.
2. `nResults` - Number of results to return.
3. `metadata` - Metadata to filter the search results.

#### Request body type
```typescript
type SearchRequest = {
    queryText: string; // or embeddings: number[]
    nResults: number;
    metadata: {[key: string]: string | number | boolean};
}
```

### Response
- 200 OK
```json
[{
    "key": "7e03b8e6-5049-4842-b574-e2aa264a5de3",
    "documentId": "1",
    "document": "Document 1",
    "metadata": {
        "isCurrent": true
    },
    "createdAt": "2024-05-26T19:10:12.880Z",
    "updatedAt": "2024-05-26T19:10:12.880Z"
}]
```

#### Response 
```typescript
type SearchResponse = {
    key: string;
    documentId: string;
    document: string; // or embeddings: number[]
    metadata: {[key: string]: string | number | boolean};
    createdAt: string;
    updatedAt: string;
}[]
```

**You can add `returnEmbeddings=yes` query parameter to return the embeddings in the response.**

## Get

### GET /{collection_name}/:key

same as the search response.


**Info:** Soon we will implement swagger documentation for the API endpoints.