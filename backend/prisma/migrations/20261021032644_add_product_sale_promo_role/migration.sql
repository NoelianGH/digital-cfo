-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('MASUK', 'KELUAR', 'MODAL');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('PENJUALAN', 'PEMBELIAN', 'GAJI', 'OPERASIONAL', 'LAINNYA');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'OCR', 'VOICE', 'POS');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TUNAI', 'QRIS', 'TRANSFER', 'KARTU_DEBIT', 'LAINNYA');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('MAKANAN', 'MINUMAN', 'JASA', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('DISKON', 'CASHBACK', 'BUY_ONE_GET_ONE', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PromoStatus" AS ENUM ('AKTIF', 'NON_AKTIF', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FeedbackRating" AS ENUM ('POOR', 'AVERAGE', 'GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('FINANCIAL', 'OPERATIONAL', 'STRATEGIC');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "businessName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL',
    "paymentMethod" "PaymentMethod",
    "status" "VerificationStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL DEFAULT 'LAINNYA',
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "priceAtSale" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "productId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TUNAI',
    "receiptCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromoType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minPurchase" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PromoStatus" NOT NULL DEFAULT 'AKTIF',
    "claimedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_indicators" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cash_runway" DOUBLE PRECISION NOT NULL,
    "unit_economics" DOUBLE PRECISION NOT NULL,
    "trend_analysis" DOUBLE PRECISION NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "financial_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_scores" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "indicatorsId" TEXT NOT NULL,

    CONSTRAINT "health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "trigger_condition" TEXT NOT NULL,
    "impact_score" DOUBLE PRECISION NOT NULL,
    "urgency_score" DOUBLE PRECISION NOT NULL,
    "ease_score" DOUBLE PRECISION NOT NULL,
    "cost_score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommended_actions" (
    "id" TEXT NOT NULL,
    "preference_value" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "healthScoreId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,

    CONSTRAINT "recommended_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_feedback" (
    "id" TEXT NOT NULL,
    "feedback" TEXT,
    "rating" "FeedbackRating" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "action_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sales_receiptCode_key" ON "sales"("receiptCode");

-- CreateIndex
CREATE UNIQUE INDEX "sales_transactionId_key" ON "sales"("transactionId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promos" ADD CONSTRAINT "promos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_indicators" ADD CONSTRAINT "financial_indicators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_scores" ADD CONSTRAINT "health_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_scores" ADD CONSTRAINT "health_scores_indicatorsId_fkey" FOREIGN KEY ("indicatorsId") REFERENCES "financial_indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_actions" ADD CONSTRAINT "recommended_actions_healthScoreId_fkey" FOREIGN KEY ("healthScoreId") REFERENCES "health_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_actions" ADD CONSTRAINT "recommended_actions_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_feedback" ADD CONSTRAINT "action_feedback_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_feedback" ADD CONSTRAINT "action_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
