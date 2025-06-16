import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/app/actions/departments";

export const useDepartmentStore = create()(
  devtools(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      fetch: async () => {
        set({ isLoading: true, error: null });
        const result = await getAllDepartments();
        if (result.success) {
          set({ items: result.departments, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },
      create: async (formData) => {
        set({ isLoading: true, error: null });
        const result = await createDepartment(formData);
        if (result.success) {
          set((state) => ({ items: [...state.items, result.department], isLoading: false }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
      update: async (formData) => {
        set({ isLoading: true, error: null });
        const result = await updateDepartment(formData);
        if (result.success) {
          set((state) => ({
            items: state.items.map((item) => (item.departmentId === result.department.departmentId ? result.department : item)),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
      delete: async (departmentId) => {
        set({ isLoading: true, error: null });
        const result = await deleteDepartment(departmentId);
        if (result.success) {
          set((state) => ({
            items: state.items.filter((item) => item.departmentId !== departmentId),
            isLoading: false,
          }));
          return true;
        } else {
          set({ error: result.error, isLoading: false });
          return false;
        }
      },
    }),
    { name: "departmentStore" }
  )
);