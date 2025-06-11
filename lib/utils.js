import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function generateCode(prefix) {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${random}`.toUpperCase()
}

export function generateProductCode() {
  return generateCode("PRD")
}

export function generateCategoryCode() {
  return generateCode("CAT")
}

export function generateEmployeeCode() {
  return generateCode("EMP")
}

export function generateCustomerCode() {
  return generateCode("CUS")
}

export function generateSupplierCode() {
  return generateCode("SUP")
}

export function generatePositionCode() {
  return generateCode("POS")
}

export function generateDepartmentCode() {
  return generateCode("DEP")
}

export function generateInvoiceCode() {
  return generateCode("INV")
}

export function generatePaymentCode() {
  return generateCode("PAY")
}

export function generateBrandCode() {
  return generateCode("BRD")
}

export function generateBranchCode() {
  return generateCode("BRH")
}

