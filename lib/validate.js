// Auto-generated Zod schemas based on Prisma models
import { z } from "zod"

export const SaleDetailSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  amount: z.number().min(0),
  memo: z.string().optional()
})

export const CreateSaleSchema = z.object({
  employeeId: z.string().uuid(),
  customerId: z.string().uuid(),
  branchId: z.string().uuid(),
  saleDate: z.coerce.date().optional(),
  amount: z.number().min(0),
  status: z.enum(["active", "inactive", "pending", "approved", "rejected", "cancelled", "paid"]).optional(),
  memo: z.string().optional(),
  invoice: z.string().optional(),
  items: z.array(SaleDetailSchema)
})

export const UpdateSaleSchema = CreateSaleSchema.extend({
  saleId: z.string().uuid()
})

export const CreateProductSchema = z.object({
  productName: z.string(),
  productCode: z.string().optional(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  unit: z.string().optional(),
  capacity: z.number().nonnegative(),
  sellPrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  discountRate: z.number().int().min(0).max(100),
  status: z.enum(["active", "inactive"]).optional(),
  desc: z.string().optional(),
  picture: z.string().url().optional()
})

export const CreateCustomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  gender: z.enum(["male", "female", "others"]),
  phone: z.string().optional(),
  picture: z.string().url().optional(),
  employeeId: z.string().uuid().optional()
})

export const CreateStockSchema = z.object({
  productId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  quantity: z.number().int(),
  unit: z.string(),
  memo: z.string().optional()
})
