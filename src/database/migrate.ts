#!/usr/bin/env node

import { MikroORM } from "@mikro-orm/core";
import logger from "@utils/logger";
import configs from "./config";

type CommandOptions = {
  up?: boolean;
  down?: boolean;
  to?: number;
  create?: boolean;
  blank?: boolean;
};

class MigrationManager {
  private options: CommandOptions;

  constructor(argv: string[]) {
    this.options = this.parseArguments(argv);
    this.validateOptions();
  }

  private parseArguments(argv: string[]): CommandOptions {
    const options: CommandOptions = {};
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      switch (arg) {
        case "--up":
          options.up = true;
          break;
        case "--down":
          options.down = true;
          break;
        case "--to":
          const version = parseInt(argv[i + 1], 10);
          if (!isNaN(version)) {
            options.to = version;
            i++;
          } else {
            logger.error("The --to option must be followed by a valid number");
            process.exit(1);
          }
          break;
        case "--create":
          options.create = true;
          break;
        case "--blank":
          options.blank = true;
          break;
        default:
          break;
      }
    }
    return options;
  }

  private validateOptions() {
    if (this.options.up && this.options.down) {
      logger.error("You cannot specify both --up and --down");
      process.exit(1);
    }

    if (this.options.up || this.options.down) {
      if (this.options.to && isNaN(this.options.to)) {
        logger.error("The --to option must be a valid number");
        process.exit(1);
      }
      if (this.options.down && !this.options.to) {
        logger.error("The --to option is required for down command");
        process.exit(1);
      }
    } else if (!this.options.create) {
      logger.error("You must specify either --up, --down, or create");
      process.exit(1);
    }
  }

  public async executeCommand() {
    const orm = await MikroORM.init(configs);
    const migrator = orm.getMigrator();
    try {
      if (this.options.create) {
        const isBlank = this.options.blank;
        logger.info(`Generating ${isBlank ? "blank" : "diff"} migration file`);
        const res = await migrator.createMigration(undefined, isBlank);
        if (res.fileName) {
          logger.info(`Generated migration: ${res.fileName}`);
        } else {
          logger.info("No changes were made");
        }
      } else if (this.options.up) {
        logger.info("Starting migration");
        if (this.options.to !== undefined) {
          logger.info(`Migrating up to version ${this.options.to}`);
          const res = await migrator.up({ to: this.options.to });
          if (res.length === 0) {
            logger.info("Already at the latest version");
          } else {
            res.forEach((migration) => {
              logger.info(`Migrated to version ${migration.name}`);
            });
          }
        } else {
          const res = await migrator.up();
          if (res.length === 0) {
            logger.info("Already at the latest version");
          } else {
            res.forEach((migration) => {
              logger.info(`Migrated to version ${migration.name}`);
            });
          }
        }
      } else if (this.options.down) {
        logger.info("Migrating down");
        const res = await migrator.down({ to: this.options.to });
        if (res.length === 0) {
          logger.info("Already at the earliest version");
        } else {
          res.forEach((migration) => {
            logger.info(`Migrated down to version ${migration.name}`);
          });
        }
      }
      logger.info("Migration completed!");
      await orm.close(true);
      process.exit(0);
    } catch (error) {
      logger.error(error, "Error while running migration");
      await orm.close(true);
      process.exit(0);
    }
  }
}

(async () => {
  const args = process.argv.slice(2);

  if (args[0] === "migration") {
    const manager = new MigrationManager(args.slice(1));
    await manager.executeCommand();
  } else {
    logger.error(
      "Invalid command. Usage: pnpm db migration [--up|--down|create] [--to <version>]"
    );
    process.exit(1);
  }
  process.exit(0);
})();
