import { Migration } from "@mikro-orm/migrations";

export class Migration20240510100034 extends Migration {
  async up(): Promise<void> {
    // user table
    this.addSql(
      'create table "user" ("id" serial primary key, "key" varchar(255) not null, "secret_key" text not null, "expires_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null);'
    );
    this.addSql(
      'alter table "user" add constraint "user_key_unique" unique ("key");'
    );
    // extension for pgVector
    this.addSql("CREATE EXTENSION IF NOT EXISTS vector;");
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }
}
