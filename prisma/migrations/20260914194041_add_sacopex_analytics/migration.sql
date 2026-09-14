-- CreateTable
CREATE TABLE "AnalyticsMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "platform" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsContentGenerated" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cascadeId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentData" TEXT NOT NULL,
    "llmModel" TEXT NOT NULL DEFAULT 'claude-3-sonnet',
    "duration" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsContentPublished" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "publishedUrl" TEXT,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsSyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "batchSize" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "AnalyticsMetric_contentId_idx" ON "AnalyticsMetric"("contentId");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_createdAt_idx" ON "AnalyticsMetric"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsContentGenerated_cascadeId_idx" ON "AnalyticsContentGenerated"("cascadeId");

-- CreateIndex
CREATE INDEX "AnalyticsContentGenerated_createdAt_idx" ON "AnalyticsContentGenerated"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsContentPublished_contentId_idx" ON "AnalyticsContentPublished"("contentId");

-- CreateIndex
CREATE INDEX "AnalyticsContentPublished_platform_idx" ON "AnalyticsContentPublished"("platform");

-- CreateIndex
CREATE INDEX "AnalyticsContentPublished_createdAt_idx" ON "AnalyticsContentPublished"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsSyncLog_status_idx" ON "AnalyticsSyncLog"("status");

-- CreateIndex
CREATE INDEX "AnalyticsSyncLog_createdAt_idx" ON "AnalyticsSyncLog"("createdAt");
