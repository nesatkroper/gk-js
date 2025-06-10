import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createBaseStore } from "./base-store-factory"


export const useRoleStore = create()(
  devtools(
    createBaseStore({
      endpoint: "/api/roles",
      entityName: "roles",
      idField: "roleId",
    }),
    { name: "role-store" },
  ),
)
