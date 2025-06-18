"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { ViewToggle } from "@/components/ui/view-toggle";
import { DataTable } from "@/components/ui/data-table";
import { DataCards } from "@/components/ui/data-cards";
import { Plus, Search, MapPin, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAddressStore } from "@/stores/address-store";
import { useCustomerStore } from "@/stores/customer-store";
import { useEmployeeStore } from "@/stores/employee-store";
import { useSupplierStore } from "@/stores/supplier-store";
import { useEventStore } from "@/stores/event-store";
import { useTranslation } from "react-i18next";
import {
  getAllProvinces,
  getDistrictsByProvinceId,
  getCommunesByDistrictId,
  getVillagesByCommuneId,
} from "@/app/actions/addresses";

export default function AddressPage() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const {
    items: addresses,
    isLoading: addrLoading,
    error: addrError,
    fetch: fetchAddresses,
    create,
    update,
    delete: deleteAddress,
  } = useAddressStore();
  const {
    items: customers,
    isLoading: custLoading,
    error: custError,
    fetch: fetchCustomers,
  } = useCustomerStore();
  const {
    items: employees,
    isLoading: empLoading,
    error: empError,
    fetch: fetchEmployees,
  } = useEmployeeStore();
  const {
    items: suppliers,
    isLoading: supLoading,
    error: supError,
    fetch: fetchSuppliers,
  } = useSupplierStore();
  const {
    items: events,
    isLoading: eventLoading,
    error: eventError,
    fetch: fetchEvents,
  } = useEventStore();

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState("table");
  const [editingAddress, setEditingAddress] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedCommuneId, setSelectedCommuneId] = useState(null);
  const [selectedVillageId, setSelectedVillageId] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      fetchAddresses();
      fetchCustomers('basic');
      fetchEmployees('basic');
      fetchSuppliers();
      fetchEvents();
      const provincesRes = await getAllProvinces();
      if (!provincesRes.error) {
        setProvinces(provincesRes.data);
      }
    };
    loadInitialData();
  }, [fetchAddresses, fetchCustomers, fetchEmployees, fetchSuppliers, fetchEvents]);

  useEffect(() => {
    if (selectedProvinceId) {
      const loadDistricts = async () => {
        const districtsRes = await getDistrictsByProvinceId(selectedProvinceId);
        if (!districtsRes.error) {
          setDistricts(districtsRes.data);
        }
      };
      loadDistricts();
      setDistricts([]);
      setCommunes([]);
      setVillages([]);
      setSelectedDistrictId(null);
      setSelectedCommuneId(null);
    }
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedDistrictId) {
      const loadCommunes = async () => {
        const communesRes = await getCommunesByDistrictId(selectedDistrictId);
        if (!communesRes.error) {
          setCommunes(communesRes.data);
        }
      };
      loadCommunes();
      setCommunes([]);
      setVillages([]);
      setSelectedCommuneId(null);
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    if (selectedCommuneId) {
      const loadVillages = async () => {
        const villagesRes = await getVillagesByCommuneId(selectedCommuneId);
        if (!villagesRes.error) {
          setVillages(villagesRes.data);
        }
      };
      loadVillages();
      setVillages([]);
      setSelectedVillageId(null); // Reset village selection
    }
  }, [selectedCommuneId]);

  const activeAddresses = addresses.filter((addr) => addr.status === "active");

  const filteredAddresses = activeAddresses.filter(
    (address) =>
      address.Customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Supplier?.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Event?.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Province?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.District?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Commune?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.Village?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    {
      key: "location",
      label: t("Location"),
      render: (_value, row) =>
        `${row.Village?.name || "-"}, ${row.Commune?.name || "-"}, ${row.District?.name || "-"}, ${row.Province?.name || "-"}`,
    },
    {
      key: "coordinates",
      label: t("Coordinates"),
      render: (_value, row) =>
        row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-",
    },
    {
      key: "relatedEntity",
      label: t("Related Entity"),
      render: (_value, row) =>
        row.Customer
          ? `${row.Customer.firstName} ${row.Customer.lastName} (${t("Customer")})`
          : row.Employee
            ? `${row.Employee.firstName} ${row.Employee.lastName} (${t("Employee")})`
            : row.Supplier
              ? `${row.Supplier.supplierName} (${t("Supplier")})`
              : row.Event
                ? `${row.Event.eventName} (${t("Event")})`
                : "-",
    },
    {
      key: "Imageaddress",
      label: t("Images"),
      type: "badge",
      render: (_value, row) => row.Imageaddress?.length || 0,
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
  ];

  const cardFields = [
    {
      key: "location",
      label: t("Location"),
      primary: true,
      render: (_value, row) =>
        `${row.Village?.name || "-"}, ${row.Commune?.name || "-"}, ${row.District?.name || "-"}, ${row.Province?.name || "-"}`,
    },
    {
      key: "coordinates",
      label: t("Coordinates"),
      secondary: true,
      render: (_value, row) =>
        row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-",
    },
    {
      key: "relatedEntity",
      label: t("Related Entity"),
      render: (_value, row) =>
        row.Customer
          ? `${row.Customer.firstName} ${row.Customer.lastName} (${t("Customer")})`
          : row.Employee
            ? `${row.Employee.firstName} ${row.Employee.lastName} (${t("Employee")})`
            : row.Supplier
              ? `${row.Supplier.supplierName} (${t("Supplier")})`
              : row.Event
                ? `${row.Event.eventName} (${t("Event")})`
                : "-",
    },
    {
      key: "Imageaddress",
      label: t("Images"),
      type: "badge",
      render: (_value, row) => row.Imageaddress?.length || 0,
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
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addressData = {
      provinceId: formData.get("provinceId") ? Number(formData.get("provinceId")) : null,
      districtId: formData.get("districtId") ? Number(formData.get("districtId")) : null,
      communeId: formData.get("communeId") ? Number(formData.get("communeId")) : null,
      villageId: formData.get("villageId") ? Number(formData.get("villageId")) : null,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
      customerId: formData.get("customerId") || null,
      employeeId: formData.get("employeeId") || null,
      supplierId: formData.get("supplierId") || null,
      eventId: formData.get("eventId") || null,
    };

    setIsSaving(true);
    try {
      const success = editingAddress
        ? await update(editingAddress.addressId, addressData)
        : await create(addressData);
      setIsSaving(false);

      if (success) {
        toast({
          title: t("Success"),
          description: t(editingAddress ? "Address updated successfully" : "Address created successfully"),
        });
        setIsDialogOpen(false);
        setEditingAddress(null);
        e.target.reset();
      } else {
        throw new Error(t("Address operation failed"));
      }
    } catch (error) {
      setIsSaving(false);
      toast({
        title: t("Error"),
        description: error.message || t(editingAddress ? "Failed to update address" : "Failed to create address"),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setSelectedProvinceId(address.provinceId);
    setSelectedDistrictId(address.districtId);
    setSelectedCommuneId(address.communeId);
    setSelectedVillageId(address.villageId);
    setIsDialogOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm(t("Are you sure you want to delete this address?"))) return;

    try {
      const success = await deleteAddress(addressId);
      if (success) {
        toast({
          title: t("Success"),
          description: t("Address deleted successfully"),
        });
      } else {
        throw new Error(t("Failed to delete address"));
      }
    } catch (error) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete address"),
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    fetchAddresses();
    fetchCustomers('basic'); // Ensure 'basic' is passed if needed for initial fetch
    fetchEmployees('basic'); // Ensure 'basic' is passed if needed for initial fetch
    fetchSuppliers();
    fetchEvents();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Addresses')}</h1>
          <p className="text-muted-foreground">{t('Manage location data for your organization')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={addrLoading || custLoading || empLoading || supLoading || eventLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${addrLoading || custLoading || empLoading || supLoading || eventLoading ? "animate-spin" : ""}`}
            />
            {t('Refresh')}
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingAddress(null);
                setSelectedProvinceId(null);
                setSelectedDistrictId(null);
                setSelectedCommuneId(null);
                setSelectedVillageId(null); // Reset village selection
              }
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={addrLoading}>
                <Plus className="mr-2 h-4 w-4" />
                {t('Add Address')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingAddress ? t("Edit Address") : t("Add New Address")}</DialogTitle>
                <DialogDescription>
                  {editingAddress ? t("Update address details") : t("Create a new address record")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provinceId">{t("Province")} *</Label>
                    <Combobox
                      id="provinceId"
                      name="provinceId"
                      options={provinces.map((p) => ({ value: p.provinceId.toString(), label: p.name }))}
                      placeholder={t("Select province...")}
                      value={selectedProvinceId ? selectedProvinceId.toString() : ""}
                      onChange={(value) => setSelectedProvinceId(value ? Number(value) : null)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="districtId">{t("District")} *</Label>
                    <Combobox
                      id="districtId"
                      name="districtId"
                      options={districts.map((d) => ({ value: d.districtId.toString(), label: d.name }))}
                      placeholder={t("Select district...")}
                      value={selectedDistrictId ? selectedDistrictId.toString() : ""}
                      onChange={(value) => setSelectedDistrictId(value ? Number(value) : null)}
                      disabled={!selectedProvinceId}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="communeId">{t("Commune")} *</Label>
                    <Combobox
                      id="communeId"
                      name="communeId"
                      options={communes.map((c) => ({ value: c.communeId.toString(), label: c.name }))}
                      placeholder={t("Select commune...")}
                      value={selectedCommuneId ? selectedCommuneId.toString() : ""}
                      onChange={(value) => setSelectedCommuneId(value ? Number(value) : null)}
                      disabled={!selectedDistrictId}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="villageId">{t("Village")} *</Label>
                    <Combobox
                      id="villageId"
                      name="villageId"
                      options={villages.map((v) => ({ value: v.villageId.toString(), label: v.name }))}
                      placeholder={t("Select village...")}
                      value={selectedVillageId ? selectedVillageId.toString() : ""}
                      onChange={(value) => setSelectedVillageId(value ? Number(value) : null)}
                      disabled={!selectedCommuneId}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">{t("Latitude")}</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      defaultValue={editingAddress?.latitude || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">{t("Longitude")}</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      defaultValue={editingAddress?.longitude || ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerId">{t("Customer")}</Label>
                  <Combobox
                    id="customerId"
                    name="customerId"
                    options={[
                      { value: "", label: t("None") },
                      ...customers.map((c) => ({
                        value: c.customerId,
                        label: `${c.firstName} ${c.lastName}`,
                      })),
                    ]}
                    placeholder={t("Select customer...")}
                    value={editingAddress?.customerId || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">{t("Employee")}</Label>
                  <Combobox
                    id="employeeId"
                    name="employeeId"
                    options={[
                      { value: "", label: t("None") },
                      ...employees.map((e) => ({
                        value: e.employeeId,
                        label: `${e.firstName} ${e.lastName}`,
                      })),
                    ]}
                    placeholder={t("Select employee...")}
                    value={editingAddress?.employeeId || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierId">{t("Supplier")}</Label>
                  <Combobox
                    id="supplierId"
                    name="supplierId"
                    options={[
                      { value: "", label: t("None") },
                      ...suppliers.map((s) => ({
                        value: s.supplierId,
                        label: s.supplierName,
                      })),
                    ]}
                    placeholder={t("Select supplier...")}
                    value={editingAddress?.supplierId || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventId">{t("Event")}</Label>
                  <Combobox
                    id="eventId"
                    name="eventId"
                    options={[
                      { value: "", label: t("None") },
                      ...events.map((e) => ({
                        value: e.eventId,
                        label: e.eventName,
                      })),
                    ]}
                    placeholder={t("Select event...")}
                    value={editingAddress?.eventId || ""}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAddress ? t("Updating...") : t("Creating...")}
                      </>
                    ) : editingAddress ? (
                      t("Update Address")
                    ) : (
                      t("Create Address")
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      {(addrError || custError || empError || supError || eventError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive font-medium">{t("Error loading data")}</p>
                <p className="text-sm text-muted-foreground">
                  {addrError || custError || empError || supError || eventError}
                </p>
              </div>
              <Button variant="outline" onClick={handleRetry}>
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
                <MapPin className="h-5 w-5" />
                {t("Address Directory")}
                {(addrLoading || custLoading || empLoading || supLoading || eventLoading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CardTitle>
              <CardDescription>
                {t('X addresses available', { count: filteredAddresses.length })}
              </CardDescription>
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search addresses...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {view === "card" ? (
            <DataCards
              data={filteredAddresses}
              fields={cardFields}
              loading={addrLoading || custLoading || empLoading || supLoading || eventLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="addressId"
              nameField="location"
              columns={3}
            />
          ) : (
            <DataTable
              data={filteredAddresses}
              columns={tableColumns}
              loading={addrLoading || custLoading || empLoading || supLoading || eventLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idField="addressId"
              nameField="location"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// "use client";

// export const dynamic = 'force-dynamic';

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Combobox } from "@/components/ui/combobox";
// import { ViewToggle } from "@/components/ui/view-toggle";
// import { DataTable } from "@/components/ui/data-table";
// import { DataCards } from "@/components/ui/data-cards";
// import { Plus, Search, MapPin, Loader2, RefreshCw } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useAddressStore } from "@/stores/address-store";
// import { useCustomerStore } from "@/stores/customer-store";
// import { useEmployeeStore } from "@/stores/employee-store";
// import { useSupplierStore } from "@/stores/supplier-store";
// import { useEventStore } from "@/stores/event-store";
// import { useTranslation } from "react-i18next";
// import {
//   getAllProvinces,
//   getDistrictsByProvinceId,
//   getCommunesByDistrictId,
//   getVillagesByCommuneId,
// } from "@/app/actions/addresses";

// export default function AddressPage() {
//   const { t } = useTranslation('common');
//   const { toast } = useToast();
//   const {
//     items: addresses,
//     isLoading: addrLoading,
//     error: addrError,
//     fetch: fetchAddresses,
//     create,
//     update,
//     delete: deleteAddress,
//   } = useAddressStore();
//   const {
//     items: customers,
//     isLoading: custLoading,
//     error: custError,
//     fetch: fetchCustomers,
//   } = useCustomerStore();
//   const {
//     items: employees,
//     isLoading: empLoading,
//     error: empError,
//     fetch: fetchEmployees,
//   } = useEmployeeStore();
//   const {
//     items: suppliers,
//     isLoading: supLoading,
//     error: supError,
//     fetch: fetchSuppliers,
//   } = useSupplierStore();
//   const {
//     items: events,
//     isLoading: eventLoading,
//     error: eventError,
//     fetch: fetchEvents,
//   } = useEventStore();

//   const [isSaving, setIsSaving] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [view, setView] = useState("table");
//   const [editingAddress, setEditingAddress] = useState(null);
//   const [provinces, setProvinces] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [communes, setCommunes] = useState([]);
//   const [villages, setVillages] = useState([]);
//   const [selectedProvinceId, setSelectedProvinceId] = useState(null);
//   const [selectedDistrictId, setSelectedDistrictId] = useState(null);
//   const [selectedCommuneId, setSelectedCommuneId] = useState(null);
//   const [selectedVillageId, setSelectedVillageId] = useState(null);

//   useEffect(() => {
//     const loadInitialData = async () => {
//       fetchAddresses();
//       fetchCustomers('basic');
//       fetchEmployees('basic');
//       fetchSuppliers();
//       fetchEvents();
//       const provincesRes = await getAllProvinces();
//       if (!provincesRes.error) {
//         setProvinces(provincesRes.data);
//       }
//     };
//     loadInitialData();
//   }, [fetchAddresses, fetchCustomers, fetchEmployees, fetchSuppliers, fetchEvents]);

//   useEffect(() => {
//     if (selectedProvinceId) {
//       const loadDistricts = async () => {
//         const districtsRes = await getDistrictsByProvinceId(selectedProvinceId);
//         if (!districtsRes.error) {
//           setDistricts(districtsRes.data);
//         }
//       };
//       loadDistricts();
//       setDistricts([]);
//       setCommunes([]);
//       setVillages([]);
//       setSelectedDistrictId(null);
//       setSelectedCommuneId(null);
//     }
//   }, [selectedProvinceId]);

//   useEffect(() => {
//     if (selectedDistrictId) {
//       const loadCommunes = async () => {
//         const communesRes = await getCommunesByDistrictId(selectedDistrictId);
//         if (!communesRes.error) {
//           setCommunes(communesRes.data);
//         }
//       };
//       loadCommunes();
//       setCommunes([]);
//       setVillages([]);
//       setSelectedCommuneId(null);
//     }
//   }, [selectedDistrictId]);

//   useEffect(() => {
//     if (selectedCommuneId) {
//       const loadVillages = async () => {
//         const villagesRes = await getVillagesByCommuneId(selectedCommuneId);
//         if (!villagesRes.error) {
//           setVillages(villagesRes.data);
//         }
//       };
//       loadVillages();
//       setVillages([]);
//     }
//   }, [selectedCommuneId]);

//   useEffect(() => {
//     if (selectedCommuneId) {
//       const loadVillages = async () => {
//         const villagesRes = await getVillagesByCommuneId(selectedCommuneId);
//         if (!villagesRes.error) {
//           setVillages(villagesRes.data);
//         }
//       };
//       loadVillages();
//       setVillages([]);
//       setSelectedVillageId(null); // Reset village selection
//     }
//   }, [selectedCommuneId]);

//   const activeAddresses = addresses.filter((addr) => addr.status === "active");

//   const filteredAddresses = activeAddresses.filter(
//     (address) =>
//       address.Customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.Employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.Supplier?.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.Event?.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.Province?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.District?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.Commune?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       address.Village?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const tableColumns = [
//     {
//       key: "location",
//       label: t("Location"),
//       render: (_value, row) =>
//         `${row.Village?.name || "-"}, ${row.Commune?.name || "-"}, ${row.District?.name || "-"}, ${row.Province?.name || "-"}`,
//     },
//     {
//       key: "coordinates",
//       label: t("Coordinates"),
//       render: (_value, row) =>
//         row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-",
//     },
//     {
//       key: "relatedEntity",
//       label: t("Related Entity"),
//       render: (_value, row) =>
//         row.Customer
//           ? `${row.Customer.firstName} ${row.Customer.lastName} (Customer)`
//           : row.Employee
//             ? `${row.Employee.firstName} ${row.Employee.lastName} (Employee)`
//             : row.Supplier
//               ? `${row.Supplier.supplierName} (Supplier)`
//               : row.Event
//                 ? `${row.Event.eventName} (Event)`
//                 : "-",
//     },
//     {
//       key: "Imageaddress",
//       label: t("Images"),
//       type: "badge",
//       render: (_value, row) => row.Imageaddress?.length || 0,
//     },
//     {
//       key: "status",
//       label: t("Status"),
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: t("Created"),
//       type: "date",
//     },
//   ];

//   const cardFields = [
//     {
//       key: "location",
//       label: t("Location"),
//       primary: true,
//       render: (_value, row) =>
//         `${row.Village?.name || "-"}, ${row.Commune?.name || "-"}, ${row.District?.name || "-"}, ${row.Province?.name || "-"}`,
//     },
//     {
//       key: "coordinates",
//       label: t("Coordinates"),
//       secondary: true,
//       render: (_value, row) =>
//         row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-",
//     },
//     {
//       key: "relatedEntity",
//       label: t("Related Entity"),
//       render: (_value, row) =>
//         row.Customer
//           ? `${row.Customer.firstName} ${row.Customer.lastName} (Customer)`
//           : row.Employee
//             ? `${row.Employee.firstName} ${row.Employee.lastName} (Employee)`
//             : row.Supplier
//               ? `${row.Supplier.supplierName} (Supplier)`
//               : row.Event
//                 ? `${row.Event.eventName} (Event)`
//                 : "-",
//     },
//     {
//       key: "Imageaddress",
//       label: t("Images"),
//       type: "badge",
//       render: (_value, row) => row.Imageaddress?.length || 0,
//     },
//     {
//       key: "status",
//       label: t("Status"),
//       type: "badge",
//     },
//     {
//       key: "createdAt",
//       label: t("Created"),
//       type: "date",
//     },
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const addressData = {
//       provinceId: formData.get("provinceId") ? Number(formData.get("provinceId")) : null,
//       districtId: formData.get("districtId") ? Number(formData.get("districtId")) : null,
//       communeId: formData.get("communeId") ? Number(formData.get("communeId")) : null,
//       villageId: formData.get("villageId") ? Number(formData.get("villageId")) : null,
//       latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
//       longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
//       customerId: formData.get("customerId") || null,
//       employeeId: formData.get("employeeId") || null,
//       supplierId: formData.get("supplierId") || null,
//       eventId: formData.get("eventId") || null,
//     };

//     setIsSaving(true);
//     try {
//       const success = editingAddress
//         ? await update(editingAddress.addressId, addressData)
//         : await create(addressData);
//       setIsSaving(false);

//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t(editingAddress ? "Address updated successfully" : "Address created successfully"),
//         });
//         setIsDialogOpen(false);
//         setEditingAddress(null);
//         e.target.reset();
//       } else {
//         throw new Error(t("Address operation failed"));
//       }
//     } catch (error) {
//       setIsSaving(false);
//       toast({
//         title: t("Error"),
//         description: error.message || t(editingAddress ? "Failed to update address" : "Failed to create address"),
//         variant: "destructive",
//       });
//     }
//   };

//   const handleEdit = (address) => {
//     setEditingAddress(address);
//     setSelectedProvinceId(address.provinceId);
//     setSelectedDistrictId(address.districtId);
//     setSelectedCommuneId(address.communeId);
//     setSelectedVillageId(address.villageId);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (addressId) => {
//     if (!confirm(t("Are you sure you want to delete this address?"))) return;

//     try {
//       const success = await deleteAddress(addressId);
//       if (success) {
//         toast({
//           title: t("Success"),
//           description: t("Address deleted successfully"),
//         });
//       } else {
//         throw new Error(t("Failed to delete address"));
//       }
//     } catch (error) {
//       toast({
//         title: t("Error"),
//         description: error.message || t("Failed to delete address"),
//         variant: "destructive",
//       });
//     }
//   };

//   const handleRetry = () => {
//     fetchAddresses();
//     fetchCustomers();
//     fetchEmployees();
//     fetchSuppliers();
//     fetchEvents();
//   };

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t('Addresses')}</h1>
//           <p className="text-muted-foreground">{t('Manage location data for your organization')}</p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={handleRetry}
//             disabled={addrLoading || custLoading || empLoading || supLoading || eventLoading}
//           >
//             <RefreshCw
//               className={`mr-2 h-4 w-4 ${addrLoading || custLoading || empLoading || supLoading || eventLoading ? "animate-spin" : ""}`}
//             />
//             {t('Refresh')}
//           </Button>
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) {
//                 setEditingAddress(null);
//                 setSelectedProvinceId(null);
//                 setSelectedDistrictId(null);
//                 setSelectedCommuneId(null);
//               }
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button disabled={addrLoading}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 {t('Add Address')}
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[600px]">
//               <DialogHeader>
//                 <DialogTitle>{editingAddress ? t("Edit Address") : t("Add New Address")}</DialogTitle>
//                 <DialogDescription>
//                   {editingAddress ? t("Update address details") : t("Create a new address record")}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="provinceId">{t("Province")} *</Label>
//                     <Combobox
//                       id="provinceId"
//                       name="provinceId"
//                       options={provinces.map((p) => ({ value: p.provinceId.toString(), label: p.name }))}
//                       placeholder={t("Select province...")}
//                       value={selectedProvinceId ? selectedProvinceId.toString() : ""}
//                       onChange={(value) => setSelectedProvinceId(value ? Number(value) : null)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="districtId">{t("District")} *</Label>
//                     <Combobox
//                       id="districtId"
//                       name="districtId"
//                       options={districts.map((d) => ({ value: d.districtId.toString(), label: d.name }))}
//                       placeholder={t("Select district...")}
//                       value={selectedDistrictId ? selectedDistrictId.toString() : ""}
//                       onChange={(value) => setSelectedDistrictId(value ? Number(value) : null)}
//                       disabled={!selectedProvinceId}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="communeId">{t("Commune")} *</Label>
//                     <Combobox
//                       id="communeId"
//                       name="communeId"
//                       options={communes.map((c) => ({ value: c.communeId.toString(), label: c.name }))}
//                       placeholder={t("Select commune...")}
//                       value={selectedCommuneId ? selectedCommuneId.toString() : ""}
//                       onChange={(value) => setSelectedCommuneId(value ? Number(value) : null)}
//                       disabled={!selectedDistrictId}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="villageId">{t("Village")} *</Label>
//                     <Combobox
//                       id="villageId"
//                       name="villageId"
//                       options={villages.map((v) => ({ value: v.villageId.toString(), label: v.name }))}
//                       placeholder={t("Select village...")}
//                       value={selectedVillageId ? selectedVillageId.toString() : ""}
//                       onChange={(value) => setSelectedVillageId(value ? Number(value) : null)}
//                       disabled={!selectedCommuneId}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="latitude">{t("Latitude")}</Label>
//                     <Input
//                       id="latitude"
//                       name="latitude"
//                       type="number"
//                       step="0.000001"
//                       defaultValue={editingAddress?.latitude || ""}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="longitude">{t("Longitude")}</Label>
//                     <Input
//                       id="longitude"
//                       name="longitude"
//                       type="number"
//                       step="0.000001"
//                       defaultValue={editingAddress?.longitude || ""}
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="customerId">{t("Customer")}</Label>
//                   <Combobox
//                     id="customerId"
//                     name="customerId"
//                     options={[
//                       { value: "", label: t("None") },
//                       ...customers.map((c) => ({
//                         value: c.customerId,
//                         label: `${c.firstName} ${c.lastName}`,
//                       })),
//                     ]}
//                     placeholder={t("Select customer...")}
//                     value={editingAddress?.customerId || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="employeeId">{t("Employee")}</Label>
//                   <Combobox
//                     id="employeeId"
//                     name="employeeId"
//                     options={[
//                       { value: "", label: t("None") },
//                       ...employees.map((e) => ({
//                         value: e.employeeId,
//                         label: `${e.firstName} ${e.lastName}`,
//                       })),
//                     ]}
//                     placeholder={t("Select employee...")}
//                     value={editingAddress?.employeeId || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="supplierId">{t("Supplier")}</Label>
//                   <Combobox
//                     id="supplierId"
//                     name="supplierId"
//                     options={[
//                       { value: "", label: t("None") },
//                       ...suppliers.map((s) => ({
//                         value: s.supplierId,
//                         label: s.supplierName,
//                       })),
//                     ]}
//                     placeholder={t("Select supplier...")}
//                     value={editingAddress?.supplierId || ""}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="eventId">{t("Event")}</Label>
//                   <Combobox
//                     id="eventId"
//                     name="eventId"
//                     options={[
//                       { value: "", label: t("None") },
//                       ...events.map((e) => ({
//                         value: e.eventId,
//                         label: e.eventName,
//                       })),
//                     ]}
//                     placeholder={t("Select event...")}
//                     value={editingAddress?.eventId || ""}
//                   />
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     {t("Cancel")}
//                   </Button>
//                   <Button type="submit" disabled={isSaving}>
//                     {isSaving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {editingAddress ? t("Updating...") : t("Creating...")}
//                       </>
//                     ) : editingAddress ? (
//                       t("Update Address")
//                     ) : (
//                       t("Create Address")
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </motion.div>
//       {(addrError || custError || empError || supError || eventError) && (
//         <Card className="border-destructive">
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-destructive font-medium">{t("Error loading data")}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {addrError || custError || empError || supError || eventError}
//                 </p>
//               </div>
//               <Button variant="outline" onClick={handleRetry}>
//                 {t("Try Again")}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5" />
//                 {t("Address Directory")}
//                 {(addrLoading || custLoading || empLoading || supLoading || eventLoading) && (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 )}
//               </CardTitle>
//               <CardDescription>
//                 {t(`{count}addresses in your database`, { count: filteredAddresses.length })}
//               </CardDescription>
//             </div>
//             <ViewToggle view={view} onViewChange={setView} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1 max-w-sm">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder={t("Search addresses...")}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>
//           {view === "card" ? (
//             <DataCards
//               data={filteredAddresses}
//               fields={cardFields}
//               loading={addrLoading || custLoading || empLoading || supLoading || eventLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="addressId"
//               nameField="location"
//               columns={3}
//             />
//           ) : (
//             <DataTable
//               data={filteredAddresses}
//               columns={tableColumns}
//               loading={addrLoading || custLoading || empLoading || supLoading || eventLoading}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               idField="addressId"
//               nameField="location"
//             />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

