
export const softDeleteWhere = {
  active: { status: "active" },
  all: {},
}

export const softDelete = {
  delete: { status: "inactive" },
  restore: { status: "active" },
}
