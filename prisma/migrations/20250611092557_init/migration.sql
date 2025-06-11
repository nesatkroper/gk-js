-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('checkin', 'checkout', 'absent');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'others');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'creditCard', 'khqr', 'leave');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive', 'pending', 'approved', 'rejected', 'cancelled', 'paid');

-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('in', 'out');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('default', 'pos', 'reserve');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('permanent', 'contract', 'intern', 'temporary');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'divorced', 'widowed');

-- CreateTable
CREATE TABLE "Address" (
    "addressId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provinceId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "communeId" INTEGER NOT NULL,
    "villageId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "customerId" UUID,
    "employeeId" UUID,
    "supplierId" UUID,
    "eventId" UUID,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendanceId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "method" TEXT,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOut" TIMESTAMP(3),
    "note" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendanceId")
);

-- CreateTable
CREATE TABLE "Auth" (
    "authId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "roleId" UUID NOT NULL,
    "employeeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'active',

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("authId")
);

-- CreateTable
CREATE TABLE "AuthLog" (
    "id" SERIAL NOT NULL,
    "authId" UUID NOT NULL,
    "method" TEXT,
    "url" TEXT,
    "status" INTEGER,
    "responseTime" DOUBLE PRECISION,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "branchId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branchName" TEXT NOT NULL,
    "branchCode" TEXT,
    "picture" TEXT,
    "tel" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("branchId")
);

-- CreateTable
CREATE TABLE "Brand" (
    "brandId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandName" TEXT NOT NULL,
    "picture" TEXT,
    "brandCode" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("brandId")
);

-- CreateTable
CREATE TABLE "Cart" (
    "cartId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("cartId")
);

-- CreateTable
CREATE TABLE "Cartnote" (
    "cartnoteId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cartId" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cartnote_pkey" PRIMARY KEY ("cartnoteId")
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "picture" TEXT,
    "categoryName" TEXT NOT NULL,
    "categoryCode" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "Commune" (
    "communeId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL,
    "type" VARCHAR(50),
    "code" VARCHAR(50),
    "khName" VARCHAR(50),
    "provinceId" INTEGER,
    "createdAt" TIMESTAMP(6),
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("communeId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'male',
    "phone" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "employeeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "Customerinfo" (
    "customerId" UUID NOT NULL,
    "picture" TEXT,
    "region" TEXT,
    "email" TEXT,
    "note" TEXT,
    "loyaltyPoints" INTEGER DEFAULT 0,
    "lastPurchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "govId" TEXT,
    "govPicture" TEXT,
    "govExpire" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'active'
);

-- CreateTable
CREATE TABLE "Department" (
    "departmentId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "departmentName" TEXT NOT NULL,
    "departmentCode" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("departmentId")
);

-- CreateTable
CREATE TABLE "District" (
    "districtId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provinceId" INTEGER NOT NULL,
    "type" VARCHAR(50),
    "code" VARCHAR(50),
    "khName" VARCHAR(50),
    "createdAt" TIMESTAMP(6),
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "District_pkey" PRIMARY KEY ("districtId")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employeeId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "positionId" UUID NOT NULL,
    "branchId" UUID,
    "departmentId" UUID NOT NULL,
    "employeeCode" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'male',
    "dob" TIMESTAMP(3),
    "phone" TEXT,
    "email" TEXT,
    "salary" DECIMAL(10,2) NOT NULL,
    "hiredDate" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employeeId")
);

-- CreateTable
CREATE TABLE "Employeeinfo" (
    "employeeId" UUID NOT NULL,
    "managerId" UUID,
    "picture" TEXT,
    "region" TEXT,
    "nationality" TEXT,
    "note" TEXT,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'single',
    "emergencyContact" TEXT,
    "bloodType" TEXT,
    "bankAccount" TEXT,
    "govExpire" TIMESTAMP(3),
    "govId" TEXT,
    "govPicture" TEXT,
    "terminationDate" TIMESTAMP(3),
    "contractType" "ContractType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active'
);

-- CreateTable
CREATE TABLE "Entry" (
    "entryId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,
    "entryPrice" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "entryDate" TIMESTAMP(3),
    "productId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "invoice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("entryId")
);

-- CreateTable
CREATE TABLE "Event" (
    "eventId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventName" TEXT NOT NULL,
    "memo" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "Imageaddress" (
    "imageId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT,
    "addressId" UUID NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imageaddress_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "Khqr" (
    "khqrId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account" TEXT NOT NULL DEFAULT 'suon_phanun@aclb',
    "name" TEXT NOT NULL DEFAULT 'PHANUN SUON',
    "city" TEXT NOT NULL DEFAULT 'Siem Reap',
    "amount" DECIMAL(12,2) DEFAULT 0.00,
    "currency" TEXT DEFAULT 'usd',
    "token" TEXT NOT NULL DEFAULT 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiNDdjMGY2MzY4ZTFmNGFjYSJ9LCJpYXQiOjE3NDgxNDA0MzgsImV4cCI6MTc1NTkxNjQzOH0.CSNbF2clfRi2f8ROhyOGF8Nxyz5lqet0Nb1iWEvwaDU',
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Khqr_pkey" PRIMARY KEY ("khqrId")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "leaveId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "Status" NOT NULL DEFAULT 'pending',
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("leaveId")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "method" TEXT,
    "url" TEXT,
    "status" INTEGER,
    "responseTime" DOUBLE PRECISION,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "invoice" TEXT,
    "hash" TEXT,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "externalRef" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "Position" (
    "positionId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "departmentId" UUID NOT NULL,
    "positionName" TEXT,
    "positionCode" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("positionId")
);

-- CreateTable
CREATE TABLE "Product" (
    "productId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productName" TEXT NOT NULL,
    "productCode" TEXT,
    "categoryId" UUID NOT NULL,
    "brandId" UUID,
    "picture" TEXT,
    "unit" TEXT,
    "capacity" DECIMAL(10,2) DEFAULT 0.00,
    "sellPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "discountRate" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'active',
    "desc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Province" (
    "provinceId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" VARCHAR(50),
    "khName" VARCHAR(50),
    "createdAt" TIMESTAMP(6),
    "updatedAt" TIMESTAMP(6),
    "code" VARCHAR(50),

    CONSTRAINT "Provine_pkey" PRIMARY KEY ("provinceId")
);

-- CreateTable
CREATE TABLE "Role" (
    "roleId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "Sale" (
    "saleId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memo" TEXT,
    "invoice" TEXT,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("saleId")
);

-- CreateTable
CREATE TABLE "Saledetail" (
    "saledetailId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "saleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memo" TEXT,

    CONSTRAINT "Saledetail_pkey" PRIMARY KEY ("saledetailId")
);

-- CreateTable
CREATE TABLE "Stock" (
    "stockId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("stockId")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "supplierId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierName" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("supplierId")
);

-- CreateTable
CREATE TABLE "System" (
    "systemId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "systemName" VARCHAR(50) NOT NULL DEFAULT 'Nun System',
    "systemType" VARCHAR(20) NOT NULL DEFAULT 'default',
    "ownerName" VARCHAR(100),
    "ownerEmail" VARCHAR(100),
    "ownerPhone" VARCHAR(20),
    "apiKey" VARCHAR(255) NOT NULL,
    "apiSecret" VARCHAR(255) NOT NULL,
    "apiUrl" VARCHAR(255) NOT NULL,
    "apiVersion" VARCHAR(10) NOT NULL DEFAULT 'v1',
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("systemId")
);

-- CreateTable
CREATE TABLE "Token" (
    "tokenId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authId" UUID,
    "token" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL DEFAULT '',
    "ipAddress" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "Village" (
    "villageId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "communeId" INTEGER NOT NULL,
    "type" VARCHAR(50),
    "code" VARCHAR(50),
    "khName" VARCHAR(50),
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "createdAt" TIMESTAMP(6),
    "updatedAt" TIMESTAMP(6),

    CONSTRAINT "Village_pkey" PRIMARY KEY ("villageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_customerId_key" ON "Address"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_employeeId_key" ON "Address"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_supplierId_key" ON "Address"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_eventId_key" ON "Address"("eventId");

-- CreateIndex
CREATE INDEX "Address_customerId_employeeId_eventId_idx" ON "Address"("customerId", "employeeId", "eventId");

-- CreateIndex
CREATE INDEX "Attendance_employeeId_eventId_idx" ON "Attendance"("employeeId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_employeeId_key" ON "Auth"("employeeId");

-- CreateIndex
CREATE INDEX "Auth_createdAt_email_status_employeeId_roleId_idx" ON "Auth"("createdAt", "email", "status", "employeeId", "roleId");

-- CreateIndex
CREATE INDEX "AuthLog_authId_status_ip_idx" ON "AuthLog"("authId", "status", "ip");

-- CreateIndex
CREATE INDEX "Cart_authId_status_idx" ON "Cart"("authId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_authId_productId_key" ON "Cart"("authId", "productId");

-- CreateIndex
CREATE INDEX "Cartnote_cartId_idx" ON "Cartnote"("cartId");

-- CreateIndex
CREATE INDEX "Customer_employeeId_idx" ON "Customer"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Customerinfo_customerId_key" ON "Customerinfo"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customerinfo_email_key" ON "Customerinfo"("email");

-- CreateIndex
CREATE INDEX "Customerinfo_customerId_idx" ON "Customerinfo"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_departmentId_employeeCode_positionId_idx" ON "Employee"("departmentId", "employeeCode", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "Employeeinfo_employeeId_key" ON "Employeeinfo"("employeeId");

-- CreateIndex
CREATE INDEX "Employeeinfo_employeeId_idx" ON "Employeeinfo"("employeeId");

-- CreateIndex
CREATE INDEX "Entry_productId_supplierId_branchId_status_entryDate_idx" ON "Entry"("productId", "supplierId", "branchId", "status", "entryDate");

-- CreateIndex
CREATE INDEX "Event_status_startDate_idx" ON "Event"("status", "startDate");

-- CreateIndex
CREATE INDEX "Imageaddress_addressId_idx" ON "Imageaddress"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "Khqr_account_key" ON "Khqr"("account");

-- CreateIndex
CREATE UNIQUE INDEX "Khqr_name_key" ON "Khqr"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Khqr_token_key" ON "Khqr"("token");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_status_startDate_endDate_idx" ON "LeaveRequest"("employeeId", "status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Log_status_ip_idx" ON "Log"("status", "ip");

-- CreateIndex
CREATE INDEX "Notification_authId_status_idx" ON "Notification"("authId", "status");

-- CreateIndex
CREATE INDEX "Payment_employeeId_fromAccountId_saleId_toAccountId_idx" ON "Payment"("employeeId", "fromAccountId", "saleId", "toAccountId");

-- CreateIndex
CREATE INDEX "Position_departmentId_positionCode_idx" ON "Position"("departmentId", "positionCode");

-- CreateIndex
CREATE INDEX "Product_categoryId_sellPrice_costPrice_discountRate_idx" ON "Product"("categoryId", "sellPrice", "costPrice", "discountRate");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Sale_customerId_employeeId_saleDate_status_branchId_idx" ON "Sale"("customerId", "employeeId", "saleDate", "status", "branchId");

-- CreateIndex
CREATE INDEX "Saledetail_productId_saledetailId_saleId_quantity_amount_idx" ON "Saledetail"("productId", "saledetailId", "saleId", "quantity", "amount");

-- CreateIndex
CREATE INDEX "Supplier_status_idx" ON "Supplier"("status");

-- CreateIndex
CREATE UNIQUE INDEX "System_systemName_key" ON "System"("systemName");

-- CreateIndex
CREATE UNIQUE INDEX "System_apiKey_key" ON "System"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "System_apiSecret_key" ON "System"("apiSecret");

-- CreateIndex
CREATE UNIQUE INDEX "System_apiUrl_key" ON "System"("apiUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Token_expiresAt_idx" ON "Token"("expiresAt");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "Token"("token");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("communeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("districtId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("provinceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("villageId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthLog" ADD CONSTRAINT "AuthLog_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartnote" ADD CONSTRAINT "Cartnote_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("cartId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("districtId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customerinfo" ADD CONSTRAINT "Customerinfo_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("provinceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("positionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employeeinfo" ADD CONSTRAINT "Employeeinfo_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imageaddress" ADD CONSTRAINT "Imageaddress_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("saleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("departmentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("brandId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saledetail" ADD CONSTRAINT "Saledetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saledetail" ADD CONSTRAINT "Saledetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("saleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("authId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("communeId") ON DELETE RESTRICT ON UPDATE CASCADE;
