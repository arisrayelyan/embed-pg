import { TSMigrationGenerator } from "@mikro-orm/migrations";

export class EmbedPgMigrationGenerator extends TSMigrationGenerator {
  generate(
    diff: { up: string[]; down: string[] },
    path?: string | undefined,
    name?: string | undefined
  ): Promise<[string, string]> {
    const { up, down } = diff;
    // whenever up or down contains type vector we need to ignore it
    // as it is not supported by mikro-orm
    const regex = /type vector\(\d+\)/;
    // find indexes of the sql that contains type vector
    const indexes = up
      .map((sql, index) => (sql.match(regex) ? index : -1))
      .filter((index) => index !== -1);
    // remove the sql that contains type vector
    const upFiltered = up.filter((_, index) => !indexes.includes(index));
    const downFiltered = down.filter((_, index) => !indexes.includes(index));
    if (!upFiltered.length && !downFiltered.length) {
      return Promise.resolve(["", ""]);
    }
    return super.generate({ up: upFiltered, down: downFiltered }, path, name);
  }
}
