import { Migration } from "@mikro-orm/migrations";

export class Migration20240524140238 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "product" ("id" serial primary key, "key" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "embedding" vector(1536) not null, "document_id" varchar(255) not null, "document" text not null, "metadata" jsonb null);'
    );
    this.addSql(
      'alter table "product" add constraint "product_key_unique" unique ("key");'
    );
    this.addSql(
      'create index "product_document_id_index" on "product" ("document_id");'
    );
    this.addSql(
      'CREATE INDEX ON "product" USING hnsw (embedding vector_cosine_ops);'
    );
    this.addSql(
      'create index "product_metadata_color_index" on "product" (("metadata"->>\'color\'));'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "product" cascade;');
  }
}
