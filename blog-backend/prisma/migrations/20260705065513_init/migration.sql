-- CreateTable
CREATE TABLE "t_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "t_article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "cover_url" TEXT,
    "content" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL,
    CONSTRAINT "t_article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "t_category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "t_category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "t_tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "t_article_tag" (
    "article_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    PRIMARY KEY ("article_id", "tag_id"),
    CONSTRAINT "t_article_tag_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "t_article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "t_article_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "t_tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "t_comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "article_id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "content" TEXT NOT NULL,
    "reply_to" INTEGER,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL,
    CONSTRAINT "t_comment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "t_article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "t_link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "t_site_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_key" TEXT NOT NULL,
    "config_value" TEXT,
    "is_deleted" INTEGER NOT NULL DEFAULT 0,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "t_user_username_key" ON "t_user"("username");

-- CreateIndex
CREATE INDEX "t_user_is_deleted_idx" ON "t_user"("is_deleted");

-- CreateIndex
CREATE INDEX "t_article_category_id_idx" ON "t_article"("category_id");

-- CreateIndex
CREATE INDEX "t_article_status_idx" ON "t_article"("status");

-- CreateIndex
CREATE INDEX "t_article_is_deleted_idx" ON "t_article"("is_deleted");

-- CreateIndex
CREATE INDEX "t_article_created_time_idx" ON "t_article"("created_time");

-- CreateIndex
CREATE INDEX "t_category_is_deleted_idx" ON "t_category"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "t_tag_name_key" ON "t_tag"("name");

-- CreateIndex
CREATE INDEX "t_tag_is_deleted_idx" ON "t_tag"("is_deleted");

-- CreateIndex
CREATE INDEX "t_comment_article_id_idx" ON "t_comment"("article_id");

-- CreateIndex
CREATE INDEX "t_comment_is_deleted_idx" ON "t_comment"("is_deleted");

-- CreateIndex
CREATE INDEX "t_comment_created_time_idx" ON "t_comment"("created_time");

-- CreateIndex
CREATE INDEX "t_link_is_deleted_idx" ON "t_link"("is_deleted");

-- CreateIndex
CREATE INDEX "t_link_sort_order_idx" ON "t_link"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "t_site_config_config_key_key" ON "t_site_config"("config_key");

-- CreateIndex
CREATE INDEX "t_site_config_config_key_idx" ON "t_site_config"("config_key");
