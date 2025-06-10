"use client"


import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"



export function DataCards({
  data,
  fields,
  loading = false,
  onEdit,
  // onDelete,
  onView,
  idField = "id",
  imageField = "picture",
  nameField = "name",
  actions = true,
  columns = 4,
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }

  const { canUpdate } = usePermissions()

  const renderField = (field, value, row) => {
    if (field.render) {
      return field.render(value, row)
    }

    switch (field.type) {
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
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {row[imageField] ? (
              <img
                src={row[imageField] || "/placeholder.svg"}
                alt={row[nameField] || "Image"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Eye className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
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
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {data.map((row, index) => {
        const imageField_obj = fields.find((f) => f.type === "image")
        const primaryField = fields.find((f) => f.primary)
        const secondaryField = fields.find((f) => f.secondary)

        return (
          <Card key={row[idField] || index} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Image */}
                {imageField_obj && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    {row[imageField_obj.key] ? (
                      <img
                        src={row[imageField_obj.key] || "/placeholder.svg"}
                        alt={row[nameField] || "Image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Eye className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2">
                  {/* Primary field (title) */}
                  {primaryField && (
                    <div>
                      <h3 className="font-semibold line-clamp-2">
                        {renderField(primaryField, row[primaryField.key], row)}
                      </h3>
                    </div>
                  )}

                  {/* Secondary field (subtitle) */}
                  {secondaryField && (
                    <p className="text-sm text-muted-foreground">
                      {renderField(secondaryField, row[secondaryField.key], row)}
                    </p>
                  )}

                  {/* Other fields */}
                  <div className="space-y-1">
                    {fields
                      .filter((f) => !f.primary && !f.secondary && !f.hidden && f.type !== "image")
                      .map((field) => (
                        <div key={field.key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{field.label || field.key}:</span>
                          <span className="font-medium">{renderField(field, row[field.key], row)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                {actions && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onView && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(row)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    {onEdit && canUpdate && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(row)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
