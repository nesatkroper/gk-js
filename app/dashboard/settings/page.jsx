"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Building, Bell, Shield, Database, Mail, Smartphone, Globe, Save } from "lucide-react"
import { useTranslation } from "react-i18next" // Import useTranslation

export const dynamic = 'force-dynamic';
export default function SettingsPage() {
  const { t } = useTranslation('common'); // Initialize useTranslation
  const [settings, setSettings] = useState({
    company: {
      name: "FertilizerMS Company",
      address: "123 Business Street",
      city: "Business City",
      state: "Business State",
      zipCode: "12345",
      phone: "+1 (555) 123-4567",
      email: "info@fertilizer.com",
      website: "www.fertilizer.com",
      taxId: "123-45-6789",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      salesNotifications: true,
      systemUpdates: true,
      marketingEmails: false,
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: "365",
      maintenanceMode: false,
      debugMode: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "30",
      passwordExpiry: "90",
      loginAttempts: "5",
    },
  })

  const handleSave = (section) => {
    // Here you would typically save to your backend
    console.log(`Saving ${section} settings:`, settings[section])
    alert(t("{{section}} settings saved successfully!", { section: t(section.charAt(0).toUpperCase() + section.slice(1)) }))
  }

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Settings")}</h1>
          <p className="text-muted-foreground">{t("Manage your application preferences and configuration")}</p>
        </div>
      </motion.div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">{t("Company")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("Notifications")}</TabsTrigger>
          <TabsTrigger value="system">{t("System")}</TabsTrigger>
          <TabsTrigger value="security">{t("Security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t("Company Information")}
              </CardTitle>
              <CardDescription>{t("Update your company details and contact information")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t("Company Name")}</Label>
                  <Input
                    id="companyName"
                    value={settings.company.name}
                    onChange={(e) => updateSetting("company", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t("Tax ID")}</Label>
                  <Input
                    id="taxId"
                    value={settings.company.taxId}
                    onChange={(e) => updateSetting("company", "taxId", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('Address')}</Label>
                <Textarea
                  id="address"
                  value={settings.company.address}
                  onChange={(e) => updateSetting("company", "address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("City")}</Label>
                  <Input
                    id="city"
                    value={settings.company.city}
                    onChange={(e) => updateSetting("company", "city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">{t("State")}</Label>
                  <Input
                    id="state"
                    value={settings.company.state}
                    onChange={(e) => updateSetting("company", "state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">{t("ZIP Code")}</Label>
                  <Input
                    id="zipCode"
                    value={settings.company.zipCode}
                    onChange={(e) => updateSetting("company", "zipCode", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    {t("Phone")}
                  </Label>
                  <Input
                    id="phone"
                    value={settings.company.phone}
                    onChange={(e) => updateSetting("company", "phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("Email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.company.email}
                    onChange={(e) => updateSetting("company", "email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("Website")}
                </Label>
                <Input
                  id="website"
                  value={settings.company.website}
                  onChange={(e) => updateSetting("company", "website", e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("company")}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save Company Settings")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("Notification Preferences")}
              </CardTitle>
              <CardDescription>{t("Configure how you want to receive notifications")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">{t("General Notifications")}</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Email Notifications")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Receive notifications via email")}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("SMS Notifications")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Receive notifications via SMS")}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateSetting("notifications", "smsNotifications", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">{t("Business Notifications")}</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Low Stock Alerts")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Get notified when inventory is low")}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.lowStockAlerts}
                    onCheckedChange={(checked) => updateSetting("notifications", "lowStockAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Sales Notifications")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Get notified about new sales")}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.salesNotifications}
                    onCheckedChange={(checked) => updateSetting("notifications", "salesNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("System Updates")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Get notified about system updates")}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemUpdates}
                    onCheckedChange={(checked) => updateSetting("notifications", "systemUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Marketing Emails")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Receive promotional emails")}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => updateSetting("notifications", "marketingEmails", checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("notifications")}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save Notification Settings")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t("System Configuration")}
              </CardTitle>
              <CardDescription>{t("Configure system behavior and maintenance settings")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">{t("Backup Settings")}</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Automatic Backup")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Enable automatic data backups")}</p>
                  </div>
                  <Switch
                    checked={settings.system.autoBackup}
                    onCheckedChange={(checked) => updateSetting("system", "autoBackup", checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">{t("Backup Frequency")}</Label>
                    <select
                      id="backupFrequency"
                      className="w-full p-2 border rounded-md"
                      value={settings.system.backupFrequency}
                      onChange={(e) => updateSetting("system", "backupFrequency", e.target.value)}
                    >
                      <option value="hourly">{t("Hourly")}</option>
                      <option value="daily">{t("Daily")}</option>
                      <option value="weekly">{t("Weekly")}</option>
                      <option value="monthly">{t("Monthly")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">{t("Data Retention (days)")}</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.system.dataRetention}
                      onChange={(e) => updateSetting("system", "dataRetention", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">{t("System Modes")}</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Maintenance Mode")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Enable maintenance mode for system updates")}</p>
                  </div>
                  <Switch
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("system", "maintenanceMode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Debug Mode")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Enable debug logging (for developers)")}</p>
                  </div>
                  <Switch
                    checked={settings.system.debugMode}
                    onCheckedChange={(checked) => updateSetting("system", "debugMode", checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("system")}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save System Settings")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("Security Settings")}
              </CardTitle>
              <CardDescription>{t("Configure security and authentication settings")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">{t("Authentication")}</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Two-Factor Authentication")}</Label>
                    <p className="text-sm text-muted-foreground">{t("Require 2FA for all users")}</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">{t("Session Timeout (minutes)")}</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting("security", "sessionTimeout", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">{t("Max Login Attempts")}</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting("security", "loginAttempts", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">{t("Password Expiry (days)")}</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => updateSetting("security", "passwordExpiry", e.target.value)}
                    className="w-full max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground">{t("Set to 0 for no expiry")}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("security")}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save Security Settings")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Switch } from "@/components/ui/switch"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Separator } from "@/components/ui/separator"
// import { Building, Bell, Shield, Database, Mail, Smartphone, Globe, Save } from "lucide-react"

// export const dynamic = 'force-dynamic';
// export default function SettingsPage() {
//   const [settings, setSettings] = useState({
//     company: {
//       name: "FertilizerMS Company",
//       address: "123 Business Street",
//       city: "Business City",
//       state: "Business State",
//       zipCode: "12345",
//       phone: "+1 (555) 123-4567",
//       email: "info@fertilizer.com",
//       website: "www.fertilizer.com",
//       taxId: "123-45-6789",
//     },
//     notifications: {
//       emailNotifications: true,
//       smsNotifications: false,
//       lowStockAlerts: true,
//       salesNotifications: true,
//       systemUpdates: true,
//       marketingEmails: false,
//     },
//     system: {
//       autoBackup: true,
//       backupFrequency: "daily",
//       dataRetention: "365",
//       maintenanceMode: false,
//       debugMode: false,
//     },
//     security: {
//       twoFactorAuth: false,
//       sessionTimeout: "30",
//       passwordExpiry: "90",
//       loginAttempts: "5",
//     },
//   })

//   const handleSave = (section) => {
//     // Here you would typically save to your backend
//     console.log(`Saving ${section} settings:`, settings[section])
//     alert(`${section} settings saved successfully!`)
//   }

//   const updateSetting = (section, key, value) => {
//     setSettings((prev) => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [key]: value,
//       },
//     }))
//   }

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
//           <p className="text-muted-foreground">Manage your application preferences and configuration</p>
//         </div>
//       </motion.div>

//       <Tabs defaultValue="company" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="company">Company</TabsTrigger>
//           <TabsTrigger value="notifications">Notifications</TabsTrigger>
//           <TabsTrigger value="system">System</TabsTrigger>
//           <TabsTrigger value="security">Security</TabsTrigger>
//         </TabsList>

//         <TabsContent value="company" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Building className="h-5 w-5" />
//                 Company Information
//               </CardTitle>
//               <CardDescription>Update your company details and contact information</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="companyName">Company Name</Label>
//                   <Input
//                     id="companyName"
//                     value={settings.company.name}
//                     onChange={(e) => updateSetting("company", "name", e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="taxId">Tax ID</Label>
//                   <Input
//                     id="taxId"
//                     value={settings.company.taxId}
//                     onChange={(e) => updateSetting("company", "taxId", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Textarea
//                   id="address"
//                   value={settings.company.address}
//                   onChange={(e) => updateSetting("company", "address", e.target.value)}
//                   rows={2}
//                 />
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="city">City</Label>
//                   <Input
//                     id="city"
//                     value={settings.company.city}
//                     onChange={(e) => updateSetting("company", "city", e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="state">State</Label>
//                   <Input
//                     id="state"
//                     value={settings.company.state}
//                     onChange={(e) => updateSetting("company", "state", e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="zipCode">ZIP Code</Label>
//                   <Input
//                     id="zipCode"
//                     value={settings.company.zipCode}
//                     onChange={(e) => updateSetting("company", "zipCode", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="phone" className="flex items-center gap-2">
//                     <Smartphone className="h-4 w-4" />
//                     Phone
//                   </Label>
//                   <Input
//                     id="phone"
//                     value={settings.company.phone}
//                     onChange={(e) => updateSetting("company", "phone", e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="flex items-center gap-2">
//                     <Mail className="h-4 w-4" />
//                     Email
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={settings.company.email}
//                     onChange={(e) => updateSetting("company", "email", e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="website" className="flex items-center gap-2">
//                   <Globe className="h-4 w-4" />
//                   Website
//                 </Label>
//                 <Input
//                   id="website"
//                   value={settings.company.website}
//                   onChange={(e) => updateSetting("company", "website", e.target.value)}
//                 />
//               </div>

//               <div className="flex justify-end">
//                 <Button onClick={() => handleSave("company")}>
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Company Settings
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="notifications" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Bell className="h-5 w-5" />
//                 Notification Preferences
//               </CardTitle>
//               <CardDescription>Configure how you want to receive notifications</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <h4 className="text-sm font-medium">General Notifications</h4>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Email Notifications</Label>
//                     <p className="text-sm text-muted-foreground">Receive notifications via email</p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.emailNotifications}
//                     onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>SMS Notifications</Label>
//                     <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.smsNotifications}
//                     onCheckedChange={(checked) => updateSetting("notifications", "smsNotifications", checked)}
//                   />
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h4 className="text-sm font-medium">Business Notifications</h4>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Low Stock Alerts</Label>
//                     <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.lowStockAlerts}
//                     onCheckedChange={(checked) => updateSetting("notifications", "lowStockAlerts", checked)}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Sales Notifications</Label>
//                     <p className="text-sm text-muted-foreground">Get notified about new sales</p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.salesNotifications}
//                     onCheckedChange={(checked) => updateSetting("notifications", "salesNotifications", checked)}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>System Updates</Label>
//                     <p className="text-sm text-muted-foreground">Get notified about system updates</p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.systemUpdates}
//                     onCheckedChange={(checked) => updateSetting("notifications", "systemUpdates", checked)}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Marketing Emails</Label>
//                     <p className="text-sm text-muted-foreground">Receive promotional emails</p>
//                   </div>
//                   <Switch
//                     checked={settings.notifications.marketingEmails}
//                     onCheckedChange={(checked) => updateSetting("notifications", "marketingEmails", checked)}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button onClick={() => handleSave("notifications")}>
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Notification Settings
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="system" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Database className="h-5 w-5" />
//                 System Configuration
//               </CardTitle>
//               <CardDescription>Configure system behavior and maintenance settings</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <h4 className="text-sm font-medium">Backup Settings</h4>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Automatic Backup</Label>
//                     <p className="text-sm text-muted-foreground">Enable automatic data backups</p>
//                   </div>
//                   <Switch
//                     checked={settings.system.autoBackup}
//                     onCheckedChange={(checked) => updateSetting("system", "autoBackup", checked)}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="backupFrequency">Backup Frequency</Label>
//                     <select
//                       id="backupFrequency"
//                       className="w-full p-2 border rounded-md"
//                       value={settings.system.backupFrequency}
//                       onChange={(e) => updateSetting("system", "backupFrequency", e.target.value)}
//                     >
//                       <option value="hourly">Hourly</option>
//                       <option value="daily">Daily</option>
//                       <option value="weekly">Weekly</option>
//                       <option value="monthly">Monthly</option>
//                     </select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="dataRetention">Data Retention (days)</Label>
//                     <Input
//                       id="dataRetention"
//                       type="number"
//                       value={settings.system.dataRetention}
//                       onChange={(e) => updateSetting("system", "dataRetention", e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-4">
//                 <h4 className="text-sm font-medium">System Modes</h4>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Maintenance Mode</Label>
//                     <p className="text-sm text-muted-foreground">Enable maintenance mode for system updates</p>
//                   </div>
//                   <Switch
//                     checked={settings.system.maintenanceMode}
//                     onCheckedChange={(checked) => updateSetting("system", "maintenanceMode", checked)}
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Debug Mode</Label>
//                     <p className="text-sm text-muted-foreground">Enable debug logging (for developers)</p>
//                   </div>
//                   <Switch
//                     checked={settings.system.debugMode}
//                     onCheckedChange={(checked) => updateSetting("system", "debugMode", checked)}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button onClick={() => handleSave("system")}>
//                   <Save className="mr-2 h-4 w-4" />
//                   Save System Settings
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="security" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Shield className="h-5 w-5" />
//                 Security Settings
//               </CardTitle>
//               <CardDescription>Configure security and authentication settings</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <h4 className="text-sm font-medium">Authentication</h4>

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label>Two-Factor Authentication</Label>
//                     <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
//                   </div>
//                   <Switch
//                     checked={settings.security.twoFactorAuth}
//                     onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
//                     <Input
//                       id="sessionTimeout"
//                       type="number"
//                       value={settings.security.sessionTimeout}
//                       onChange={(e) => updateSetting("security", "sessionTimeout", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="loginAttempts">Max Login Attempts</Label>
//                     <Input
//                       id="loginAttempts"
//                       type="number"
//                       value={settings.security.loginAttempts}
//                       onChange={(e) => updateSetting("security", "loginAttempts", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
//                   <Input
//                     id="passwordExpiry"
//                     type="number"
//                     value={settings.security.passwordExpiry}
//                     onChange={(e) => updateSetting("security", "passwordExpiry", e.target.value)}
//                     className="w-full max-w-xs"
//                   />
//                   <p className="text-sm text-muted-foreground">Set to 0 for no expiry</p>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button onClick={() => handleSave("security")}>
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Security Settings
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
