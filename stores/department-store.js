import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"





export const useDepartmentStore = create()(
  devtools(
    createBaseStore({
      endpoint: "/api/departments",
      entityName: "departments",
      idField: "departmentId",
    }),
    { name: "department-store" },
  ),
)
