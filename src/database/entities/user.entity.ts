import {
  Entity,
  OptionalProps,
  Property,
  PrimaryKey,
  Unique,
} from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class User {
  [OptionalProps]?: "oId" | "createdAt" | "updatedAt" | "key" | "expiresAt";

  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  @Unique()
  key = v4();

  @Property({ type: "text", nullable: false })
  secretKey: string;

  @Property({ nullable: true })
  expiresAt: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
