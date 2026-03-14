import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const documentTypeEnum = pgEnum("document_type", [
  "terms",
  "risk_disclosure",
  "participation_waiver",
  "privacy_notice",
]);

export const consentDocumentVersions = pgTable(
  "consent_document_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentType: documentTypeEnum("document_type").notNull(),
    version: integer("version").notNull(),
    title: text("title").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    effectiveAt: timestamp("effective_at", { mode: "date" }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    materialChangeRequired: boolean("material_change_required")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("consent_doc_type_version_idx").on(
      table.documentType,
      table.version
    ),
  ]
);
