import env from "@settings/env";
import { Options, ReflectMetadataProvider } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import * as AllEntities from "./entities";
import path from "path";
import { EmbedPgMigrationGenerator } from "./EmbedPgMigrationGenerator";

const config: Options = {
  metadataProvider: ReflectMetadataProvider,
  entities: Object.values(AllEntities),
  dbName: env.DB_NAME,
  host: env.DB_HOST,
  password: env.DB_PASSWORD,
  user: env.DB_USERNAME,
  port: +env.DB_PORT,
  driver: PostgreSqlDriver,
  forceUtcTimezone: true,
  ...(env.IS_PRODUCTION
    ? {
        driverOptions: {
          connection: { ssl: { rejectUnauthorized: false } },
        },
      }
    : {}),
  migrations: {
    tableName: "_migrations",
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts}",
    transactional: true,
    allOrNothing: true,
    snapshot: false,
    emit: "ts",
    generator: EmbedPgMigrationGenerator,
  },
  seeder: {
    path: path.join(__dirname, "./seeders"),
    defaultSeeder: "DatabaseSeeder",
    glob: "!(*.d).{js,ts}",
    emit: "ts",
  },
  extensions: [Migrator, SeedManager],
  debug: process.env.DEBUG === "true" || process.env.DEBUG?.includes("db"),
};

export default config;
