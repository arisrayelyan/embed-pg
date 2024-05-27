import { PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { v4 } from "uuid";

export type BaseEntityOptionalProps = "oId" | "createdAt" | "updatedAt" | "key";

export abstract class BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  @Unique()
  key = v4();

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
