/* eslint-disable no-console */
import { EntityRepository } from "@mikro-orm/postgresql";
import { EntityManager } from "@mikro-orm/core";
import { User } from "@database/entities";
import BaseService from "./BaseService";
import { randomBytes } from "crypto";
import logger from "@utils/logger";

export class UserService extends BaseService {
  private em: EntityManager;
  private repository: EntityRepository<User>;
  private serviceLogger = logger.child({ service: "UserService" });

  constructor({ em }: { em: EntityManager }) {
    super();
    this.em = em;
    this.repository = this.em.getRepository(User);
  }

  generateApiKey(length: number = 50): string {
    // Generate a buffer of random bytes then convert it to a base64 string
    const apiKey = randomBytes(length).toString("base64");
    // Replace any characters that might not be URL safe
    return apiKey.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async create(expiresAfter = 365): Promise<Partial<User>> {
    const currentDate = new Date();
    // Add expiresAfter to the current date
    currentDate.setDate(currentDate.getDate() + expiresAfter);
    const user = this.repository.create({
      secretKey: this.generateApiKey(10),
      expiresAt: currentDate,
    });
    try {
      await this.em.flush();
      return {
        key: user.key,
        secretKey: user.secretKey,
      };
    } catch (error) {
      console.log("Error while creating user:", error);
      return {};
    }
  }

  async validate(key: string) {
    // decode the base64 string
    const [decodedKey, decodedSecretKey] = Buffer.from(key, "base64")
      .toString("utf-8")
      .split(":");
    const user = await this.repository.findOne({
      key: decodedKey,
      secretKey: decodedSecretKey,
    });
    if (!user) {
      this.serviceLogger.error("Invalid API key");
      return false;
    }
    if (user.expiresAt && user.expiresAt < new Date()) {
      this.serviceLogger.error("API key expired");
      return false;
    }
    return true;
  }
}
