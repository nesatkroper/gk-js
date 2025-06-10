

"use client"


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"



export function DataTable({
  data,
  columns,
  loading = false,
  onEdit,
  // onDelete,
  onView,
  idField = "id",
  imageField = "picture",
  nameField = "name",
  actions = true,
}) {
  const renderCell = (column, value, row) => {
    if (column.render) {
      return column.render(value, row)
    }

    switch (column.type) {
      case "currency":
        return formatCurrency(value || 0)

      case "badge":
        const badgeVariant =
          value === "active"
            ? "default"
            : value === "inactive"
              ? "secondary"
              : typeof value === "number"
                ? value < 10
                  ? "destructive"
                  : value < 50
                    ? "secondary"
                    : "default"
                : "default"
        return <Badge variant={badgeVariant}>{value}</Badge>

      case "image":
        return (
          <div className="flex items-center gap-3">
            {row[imageField] ? (
              <img
                src={row[imageField] || "/placeholder.svg"}
                alt={row[nameField] || "Image"}
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="font-medium">{row[nameField]}</div>
              {row.code && <div className="text-sm text-muted-foreground">{row.code}</div>}
            </div>
          </div>
        )

      case "date":
        return value ? new Date(value).toLocaleDateString() : "-"

      case "number":
        return typeof value === "number" ? value.toLocaleString() : value || "-"

      default:
        return value || "-"
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.type === "image" ? (
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-md bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    )}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
            {actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={row[idField] || index} className="group">
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {renderCell(column, row[column.key], row)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onView && (
                        <Button variant="ghost" size="sm" onClick={() => onView(row)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-8 text-muted-foreground"
              >
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
