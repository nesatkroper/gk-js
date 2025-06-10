import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"



export const useCustomerStore = create()(
  devtools(
    createBaseStore({
      endpoint: "/api/customers",
      entityName: "customers",
      idField: "customerId",
      imageFields: ["picture", "govPicture"],
    }),
    { name: "customer-store" },
  ),
)
