import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"


export const useSupplierStore = create()(
  devtools(
    createBaseStore({
      endpoint: "/api/suppliers",
      entityName: "suppliers",
      idField: "supplierId",
    }),
    { name: "supplier-store" },
  ),
)
