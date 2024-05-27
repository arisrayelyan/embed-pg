<p align="center">
  <img src="./src/public/logo.png" alt="EmbedPG" width="300"/>
</p>


# EmbedPG

EmbedPG is a Node.js API service that uses PostgreSQL with the `pgvector` extension. It helps store and search vector data in a database. This project is an early version to see if it's useful for people.


# Motivation

Vector databases are really useful but often expensive and restricted. I created EmbedPG to make these databases easier and cheaper to use. It works well for different sizes of projects. The main cost comes from using cloud services like PostgreSQL and server space. EmbedPG helps you set up a vector database quickly with easy-to-use API endpoints and a command-line tool.


# Where We Store Embeddings

We store and search embeddings using PostgreSQL with the pgVector extension. You can find pgVector here: [pgVector on GitHub](https://github.com/pgvector/pgvector).

**pgVector** supports:
- Exact and approximate nearest neighbor search
- Different vector types: single-precision, half-precision, binary, and sparse vectors
- Various distance measures: L2, inner product, cosine, L1, Hamming, and Jaccard distances

# Cloud Solutions Supporting pgVector

Yes, there are cloud solutions that support pgVector:

1. **AWS RDS** - [Learn more](https://aws.amazon.com/about-aws/whats-new/2023/05/amazon-rds-postgresql-pgvector-ml-model-integration/)
2. **Google Cloud** - [Read more](https://cloud.google.com/blog/products/databases/announcing-vector-support-in-postgresql-services-to-power-ai-enabled-applications)

# Technologies and Packages Used

EmbedPG leverages several key technologies and packages to deliver its functionality:

- **Express.js**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. Express.js is used to handle routing and middleware in EmbedPG.
- **TypeScript**: A statically typed superset of JavaScript that compiles to plain JavaScript. TypeScript enhances code quality and developer productivity with type safety and modern JavaScript features.
- **MikroORM**: An ORM (Object-Relational Mapper) for TypeScript and JavaScript, inspired by Entity Framework and Doctrine. It helps in managing database operations and supports PostgreSQL, SQLite, MySQL, and MongoDB.
- **Zod**: A TypeScript-first schema declaration and validation library. Zod is used for validating the shape and type of the data at runtime, ensuring robust and error-free data handling.


# Installation and development

## Prerequisites

Before you begin the installation process, ensure that you have the following prerequisites installed:

1. The latest stable version of **Node.js** - Download it from [Node.js official site](https://nodejs.org/).
2. **pnpm** package manager - Install it by running `npm install -g pnpm`.

## Setting Up PostgreSQL with pgVector

EmbedPG requires PostgreSQL with the `pgvector` extension. You can set this up using:

- The official `pgvector` repository available at [pgvector on GitHub](https://github.com/pgvector/pgvector).
- A forked version that includes a Docker setup for easier installation, available at my repository: [arisrayelyan/pgvector on GitHub](https://github.com/arisrayelyan/pgvector).
- Or use my Docker image: [arisrayelyan/pgvector on Docker Hub](https://hub.docker.com/r/arisrayelyan/pgvector).

## Using Docker Image (Development Only)
```bash
# Pull the Docker image
docker pull arisrayelyan/pgvector:latest
# Run the Docker container
docker run -d \
--name pgvector \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_USER=postgres \
-e POSTGRES_DB=postgres \
-p 5432:5432 arisrayelyan/pgvector
```

## Installation Steps

1. **Clone the EmbedPG Repository**

   ```bash
   git clonegit@github.com:arisrayelyan/embed-pg.git
   ```
2. **Navigate to the Project Directory**

   ```bash
   cd embed-pg
   ```
3. **Install Dependencies**

   ```bash
    pnpm install
    ```
4. **Set Up Environment Variables**

   Copy the `.env.example` file to `.env` and set the environment variables as needed.

### Available Environment Variables

```bash
# General Settings
NODE_ENV=development

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_HOST=localhost
DB_PORT=5432

# Server Settings
PORT=3000
CORS_ORIGINS=http://localhost:3000 # Set the allowed origins for CORS

# OpenAI Configuration
OPENAI_API_KEY=""
OPEN_AI_MODEL=""
OPEN_AI_API_ENDPOINT=""
```
Note: OpenAI environment variables are required when EmbedPG needs to handle embedding requests for you.

## Post-Installation

After setting up your environment variables and installing EmbedPG, you're ready to set up the components needed for your service to operate effectively.

### Available Commands

- `pnpm generate:collections`: This command launches an interactive command line tool that guides you through generating all necessary components for any new collection you want to add. This includes services, API endpoints, database entities, and migrations, ensuring your vector database service is comprehensive and ready to handle specific data needs.
- `pnpm generate:token`: This command generates a new API token for your service, which you can use to authenticate requests to your EmbedPG service.
- `pnpm start`: Start the service in production mode.
- `pnpm build`: Build the application for production.
- `pnpm dev`: Start the service in development mode and apply database migrations.
- `pnpm dev:db migration`: Apply database migrations in development mode.
   - `--create` flag creates a new migration file.
   - `--up` flag applies all pending migrations.
   - `--down` flag rolls back the last migration.
   - `--to` flag applies all migrations up to a specific migration.
- `pnpm db migration`: Apply database migrations in production mode. Use the same flags as in development mode.
- `pnpm lint`: Check the source code for style and programming errors.
- `pnpm lint:fix`: Automatically fix linting errors in the source code.

### About generated files

When you generate a new collection, EmbedPG creates the following files:
1. **Service**: A service file that contains all the business logic for the collection.
2. **API Endpoint**: An API endpoint file that contains all the routes for the collection.
3. **Entity**: An entity file that defines the database schema for the collection.
4. **Migration**: A migration file that contains the SQL queries to create the database table for the collection.
5. Updates some files in the `src` directory to include the new files.

**Note**: You can customize the generated files to suit your specific needs. But do not remove the `! embedPg` comment in the files, as EmbedPG uses this to identify the generated files.

## API Documentation

Here is the [API documentation](./api_documentation.md) for EmbedPG.

## Deployment

Before deploying EmbedPG to a production environment, ensure you have set up the necessary environment variables and configurations. Also make sure 
that you are running PostgreSQL with the `pgvector` extension (See section **Cloud Solutions Supporting pgVector**).

Run the following command to build the application for production:

```bash
pnpm build
```

After build is complete you will have a `dist` directory with the compiled code. Deploy this code to your server and run the following command to start the service:

At first run the database migrations:

```bash
pnpm prod:db migration --up
```

Generate a new API token:

```bash
pnpm generate:token
```

Then start the service:

```bash
pnpm start
```

### Docker Deployment

You can also deploy EmbedPG using Docker.

Build the Docker image (**Note:** Make sure you have set up the necessary environment variables):

```bash
./scripts/build-server.sh
```


# TODO's
1. Add test coverage.
2. Improve documentation.
3. Improve metadata search functionality, implement more operators.
4. Add swagger documentation and generate it automatically with collection generation.
5. Add deployment scripts for different cloud providers.

# License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

# Contributing
Thank you for your interest in contributing to EmbedPG! See the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to the project.