import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  data: text("data").notNull().default("{}"),
  created: integer("created").notNull(),
});
export const chats = sqliteTable(
  "chats",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    data: text("data").notNull(),
    updated: integer("updated").notNull(),
  },
  (t) => [index("idx_chats_owner_updated").on(t.owner, t.updated)],
);
export const assets = sqliteTable(
  "assets",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    extracted: text("extracted").notNull().default(""),
    created: integer("created").notNull(),
  },
  (t) => [index("idx_assets_owner").on(t.owner)],
);
export const limits = sqliteTable("limits", {
  id: text("id").primaryKey(),
  count: integer("count").notNull(),
});
