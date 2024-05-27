module.exports = function (
  /** @type {import('plop').NodePlopAPI} */
  plop
) {
  plop.setHelper("lowerCase", (text) => {
    return text?.toLowerCase() || text;
  });

  plop.setHelper("capitalize", (text) => {
    return text?.charAt(0).toUpperCase() + text?.slice(1)?.toLowerCase();
  });

  plop.setHelper("parseMetadata", (value) => {
    if (!value.trim()) return "";
    return value
      .split(",")
      .map((index) => `"metadata.${index.trim()}"`)
      .join(", ");
  });

  plop.setHelper("switch", function (value, options) {
    this.switch_value = value;
    return options.fn(this);
  });

  plop.setHelper("case", function (value, options) {
    if (value == this.switch_value) {
      return options.fn(this);
    }
  });

  plop.setGenerator("collection", {
    description: "Create a new entity",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Collection name:",
        validate: function (value) {
          const reservedWords = new Set([
            "entity",
            "schema",
            "collection",
            "metadata",
            "common",
            "database",
            "src",
            "systemuser",
            "user",
            "baseservice",
            "base-service",
            "service",
            "index",
          ]);

          if (!value) return "Name is required.";
          if (reservedWords.has(value.toLowerCase()))
            return "Name cannot be a reserved word.";
          if (!/^[a-zA-Z0-9-_]+$/.test(value))
            return "The name must consist of letters, numbers, hyphens (-), and underscores (_) only.";

          return true;
        },
      },
      {
        type: "input",
        description: "Setup the vector length for the collection",
        name: "vectorLength",
        message:
          "Provide the vector length for the collection, default is 1536 (OpenAI's default):",
        default: "1536",
      },
      {
        type: "list",
        description: "Setup distance function",
        name: "distanceFunction",
        message: "Choose an option:",
        message:
          "Which distance function are you going to choose for the HNSW index?",
        choices: [
          { name: "L2 distance", value: "l2" },
          { name: "Inner product", value: "inner_product" },
          { name: "Cosine distance", value: "cosine" },
        ],
        default: "l2",
      },
      {
        type: "input",
        name: "metadataIndexes",
        message:
          "Please provide the metadata indexes for the collection, separated by commas. If none are available, leave the field empty. For example: color, price.",
        validate: function (value) {
          if (!value) return true;
          if (!/^[a-zA-Z0-9_]+(?:,\s*[a-zA-Z0-9_]+)*$/.test(value))
            return "The indexes must consist of letters, numbers and underscores (_) only, separated by commas.";
          return true;
        },
      },
      {
        type: "confirm",
        name: "embeddingProvided",
        message:
          "Are you providing embeddings? (If not, embeddings will be generated automatically using OpenAI's)",
        default: true, // Adjust default as needed.
      },
    ],
    actions: function (data) {
      const actions = [
        {
          type: "add",
          path: "src/common/schemas/{{lowerCase name}}.schema.ts",
          templateFile: "templates/Schema.hbs",
        },
        {
          type: "add",
          path: "src/database/entities/{{lowerCase name}}.entity.ts",
          templateFile: "templates/EntityTemplate.hbs",
        },
        {
          type: "add",
          path: "src/services/{{capitalize name}}Service.ts",
          templateFile: data.embeddingProvided
            ? "templates/ServiceWithEmbedding.hbs"
            : "templates/ServiceWithoutEmbedding.hbs",
        },
        {
          type: "add",
          path: "src/routes/collections/{{lowerCase name}}.ts",
          templateFile: "templates/Router.hbs",
        },
        {
          type: "append",
          path: "src/database/entities/index.ts",
          pattern:
            /\/\/ ! embedPg export entities <- don't remove this comment/g,
          template: `export * from "./{{lowerCase name}}.entity";`,
        },
        {
          type: "append",
          path: "src/routes/collections/index.ts",
          pattern:
            /\/\/ ! embedPg import routers <- don't remove this comment/g,
          template: `import {{capitalize name}}Router from "./{{lowerCase name}}";`,
        },
        {
          type: "append",
          path: "src/routes/collections/index.ts",
          pattern:
            /\/\/ ! embedPg configure routers <- don't remove this comment/g,
          template:
            "app.use(`/{{lowerCase name}}`, {{capitalize name}}Router(app));",
        },
      ];
      return actions;
    },
  });
};
