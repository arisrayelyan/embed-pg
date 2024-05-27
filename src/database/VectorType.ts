import { Type, EntityProperty, ValidationError } from "@mikro-orm/core";

export class VectorType extends Type<
  number[] | null,
  string | null | undefined
> {
  convertToDatabaseValue(value: number[] | null): string | null {
    if (!value) {
      return null;
    }
    // check value is array and contains only numbers
    if (Array.isArray(value) && value.every((v) => typeof v === "number")) {
      return JSON.stringify(value);
    }

    throw ValidationError.invalidType(VectorType, value, "JS");
  }

  convertToJSValue(value: string | undefined | null): number[] | null {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      throw ValidationError.invalidType(VectorType, value, "database");
    }
  }

  getColumnType(prop: EntityProperty) {
    return `vector(${prop.length || 100})`;
  }
}
