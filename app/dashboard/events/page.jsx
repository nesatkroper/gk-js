"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ViewToggle } from "@/components/ui/view-toggle"
import { DataTable } from "@/components/ui/data-table"
import { DataCards } from "@/components/ui/data-cards"
import { Plus, Search, Calendar, Loader2,  RefreshCcw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFormHandler } from "@/hooks/use-form"
import { useEventStore } from "@/stores/event-store"
import { FormInput, FormTextArea, FormDatePicker } from "@/components/form"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { Combobox } from "@/components/ui/combobox"
import { createEvent, updateEvent } from "@/app/actions/events"

export const dynamic = 'force-dynamic'

export default function EventsPage() {
  const { t } = useTranslation("common")
  const { canCreate } = usePermissions()
  const {
    items: events,
    isLoading: eventLoading,
    error: eventError,
    fetch: fetchEvents,
    delete: deleteEvent,
  } = useEventStore()

  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  const { formData, resetForm, setFormData, handleChange, getSubmissionData } = useFormHandler({
    eventName: "",
    memo: "",
    startDate: null,
    endDate: null,
    status: "active",
  })

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const activeEvents = events.filter((event) => event.status === "active")

  const filteredEvents = activeEvents.filter(
    (event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  const formatAddress = (address) => {
    if (!address) return "-"
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zip,
      address.country,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : "-"
  }

  const tableColumns = [
    {
      key: "eventName",
      label: t("Event Name"),
    },
    {
      key: "memo",
      label: t("Memo"),
      render: (_value, row) => row.memo || "-",
    },
    {
      key: "startDate",
      label: t("Start Date"),
      type: "date",
    },
    {
      key: "endDate",
      label: t("End Date"),
      type: "date",
    },
    {
      key: "Address",
      label: t("Address"),
      render: (_value, row) => formatAddress(row.Address),
    },
    {
      key: "Attendance.length",
      label: t("Attendees"),
      type: "badge",
      render: (_value, row) => row.Attendance?.length || 0,
    },
    {
      key: "status",
      label: t("Status"),
      type: "badge",
    },
    {
      key: "createdAt",
      label: t("Created"),
      type: "date",
    },
  ]

  const cardFields = [
    {
      key: "eventName",
      primary: true,
    },
    {
      key: "memo",
      label: t("Memo"),
      render: (_value, row) => row.memo || "-",
    },
    {
      key: "startDate",
      label: t("Start Date"),
      type: "date",
    },
    {
      key: "endDate",
      label: t("End Date"),
      type: "date",
    },
    {
      key: "Address",
      label: t("Address"),
      render: (_value, row) => formatAddress(row.Address),
    },
    {
      key: "Attendance.length",
      label: t("Attendees"),
      type: "badge",
      render: (_value, row) => row.Attendance?.length || 0,
    },
    {
      key: "status",
      label: t("Status"),
      type: "badge",
    },
    {
      key: "createdAt",
      label: t("Created"),
      type: "date",
    },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data } = getSubmissionData()
      if (!data.eventName) {
        throw new Error(t("Event name is required"))
      }
      if (!data.startDate || !data.endDate) {
        throw new Error(t("Start and end dates are required"))
      }
      if (new Date(data.endDate) < new Date(data.startDate)) {
        throw new Error(t("End date must be after start date"))
      }

      const result = editingEvent
        ? await updateEvent(editingEvent.eventId, {
            ...data,
            startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
            endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          })
        : await createEvent({
            ...data,
            startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
            endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          })

      if (!result.success) {
        throw new Error(result.error || t("Event operation failed"))
      }

      toast.success(editingEvent ? t("Event updated successfully") : t("Event created successfully"))

      setIsDialogOpen(false)
      setEditingEvent(null)
      resetForm()

      await fetchEvents()
    } catch (err) {
      console.error("Event operation error:", err)
      toast.error(err.message || t("An error occurred"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (event) => {
    setFormData({
      eventName: event.eventName || "",
      memo: event.memo || "",
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
      status: event.status || "active",
    })
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDelete = async (eventId) => {
    if (!confirm(t("Are you sure you want to delete this event?"))) return

    const success = await deleteEvent(eventId)
    if (success) {
      toast.success(t("Event deleted successfully"))
    } else {
      toast.error(t("Failed to delete event"))
    }
  }

  const handleRetry = () => {
    fetchEvents()
  }

  const handleDialogClose = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingEvent(null)
      resetForm()
    }
  }

  const statusOptions = [
    { value: "active", label: t("Active") },
    { value: "inactive", label: t("Inactive") },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Events")}</h1>
          <p className="text-muted-foreground">{t("Manage your event schedule")}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button variant="outline" onClick={handleRetry} disabled={eventLoading}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${eventLoading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button disabled={eventLoading || !canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Event")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? t("Edit Event") : t("Add New Event")}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? t("Update event details") : t("Create a new event in your schedule")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  name="eventName"
                  disabled={isSaving}
                  label={t("Event Name")}
                  value={formData.eventName}
                  placeholder={t("Event Name")}
                  onCallbackInput={handleChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormDatePicker
                    label={t("Start Date")}
                    onCallbackPicker={(date) => handleChange("startDate", date)}
                    fromYear={2020}
                    toYear={2030}
                    error={!formData.startDate && isSaving ? t("Start date is required") : null}
                    mainClass="space-y-2"
                  />
                  <FormDatePicker
                    label={t("End Date")}
                    onCallbackPicker={(date) => handleChange("endDate", date)}
                    fromYear={2020}
                    toYear={2030}
                    error={!formData.endDate && isSaving ? t("End date is required") : null}
                    mainClass="space-y-2"
                  />
                </div>
                <FormTextArea
                  rows={4}
                  name="memo"
                  label={t("Memo")}
                  disabled={isSaving}
                  value={formData.memo}
                  onCallbackInput={handleChange}
                />
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    {t("Status")}
                  </label>
                  <Combobox
                    id="status"
                    name="status"
                    options={statusOptions}
                    placeholder={t("Select status")}
                    value={formData.status}
                    onChange={(value) => handleChange("status", value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isSaving}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingEvent ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingEvent ? (
                      t("Update Event")
                    ) : (
                      t("Create Event")
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {eventError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">{eventError}</p>
              </div>
              <Button variant="outline" onClick={handleRetry} disabled={eventLoading}>
                {t("Try Again")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("Event Schedule")}
                {eventLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>{filteredEvents.length} {t("active events")}</CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search events...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={eventLoading}
              />
            </div>
          </div>

          {view === "card" ? (
            <DataCards
              data={filteredEvents}
              fields={cardFields}
              loading={eventLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="eventId"
              nameField="eventName"
              columns={4}
            />
          ) : (
            <DataTable
              data={filteredEvents}
              columns={tableColumns}
              loading={eventLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="eventId"
              nameField="eventName"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}