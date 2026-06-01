import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  RefreshCw,
  Building,
  BellRing,
  Globe,
  ShieldCheck,
  Mail,
  Users,
} from "lucide-react";

/**
 * AdminSettings — React component for managing system-wide settings.
 *
 * @purpose
 *  - Provides a fully-featured settings page for administrators to configure
 *  - Uses tabs to organize different sections for clarity.
 *
 * @param {void} None
 * @returns {JSX.Element}
 *  - Renders the settings page inside the <AppShell> layout, including:
 *    - <PageHeader> with title and description
 *    - Tabs for navigating between settings categories
 *     - Cards for each setting group, with form inputs and save buttons
 * @throws {void} No exceptions thrown currently. Can be extended to handle API errors.
 * @sideEffects
 *  - Uses local state (`useState`) to manage active tab and form inputs
 *  - Calls `useToast` to display notifications when saving settings
 *  - Currently, the `handleSaveSettings` function only triggers a toast; no backend API calls yet
 *
 * @example
 * ```tsx
 * import AdminSettings from "@/components/admin/AdminSettings";
 *
 * export default function AdminPage() {
 *   return <AdminSettings />;
 * }
 * ```
 */
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  /**
   * handleSaveSettings — Handles the save action for settings.
   *
   * @purpose Displays a toast message indicating the settings were saved.
   *
   * @param {void} None
   * @returns {void}
   * @throws {void} No exceptions thrown currently. Can be extended to handle API errors.
   * @sideEffects Displays a toast notification on the screen.
   *
   * @example
   * <Button onClick={handleSaveSettings}>Save</Button>
   */
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    // AppShell component provides the main application layout with a header, sidebar, and responsive behavior.
    <AppShell>
      {/* Page head with title and description */}
      <PageHeader
        title="Settings"
        description="Configure system settings for Institution."
      />

      {/* Tabs for different settings sections */}
      <div className="mt-6">
        {/* Tabs component */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          {/* TabsList component */}
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            {/* General Tab */}
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 justify-start px-4"
            >
              <Building className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            {/* Notifications Tab */}
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 justify-start px-4"
            >
              <BellRing className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            {/* Branches Tab */}
            <TabsTrigger
              value="branches"
              className="flex items-center gap-2 justify-start px-4"
            >
              <Globe className="h-4 w-4" />
              <span>Branches</span>
            </TabsTrigger>
            {/* Security Tab */}
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 justify-start px-4"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            {/* Integrations Tab */}
            <TabsTrigger
              value="integrations"
              className="flex items-center gap-2 justify-start px-4"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Integrations</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            {/* School Information */}
            {/* School Information Card */}
            <Card>
              {/* School Information Card Header */}
              <CardHeader>
                <CardTitle>School Information</CardTitle>
                <CardDescription>
                  Basic information about your music school
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* School Name */}
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      defaultValue="Institution Music School"
                    />
                  </div>
                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="www.Institution.com" />
                  </div>
                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" defaultValue="+91 98765 43210" />
                  </div>
                  {/* Contact Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" defaultValue="info@Institution.com" />
                  </div>
                </div>
                {/* Main Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Main Address</Label>
                  <Textarea
                    id="address"
                    defaultValue="123 Music Avenue, Mumbai, Maharashtra, India - 400001"
                  />
                </div>
              </CardContent>
              {/* School Information Card Footer */}
              <CardFooter>
                {/* Save Changes Button */}
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            {/* Business Settings Tab */}
            <Card>
              {/* Business Settings Card Header */}
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>
                  Configure basic operational settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="inr">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                        <SelectItem value="gbp">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="ist">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ist">
                          Indian Standard Time (GMT+5:30)
                        </SelectItem>
                        <SelectItem value="gmt">
                          Greenwich Mean Time (GMT)
                        </SelectItem>
                        <SelectItem value="est">
                          Eastern Standard Time (GMT-5)
                        </SelectItem>
                        <SelectItem value="pst">
                          Pacific Standard Time (GMT-8)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Fiscal Year Start */}
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                    <Select defaultValue="april">
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Week Starts On */}
                  <div className="space-y-2">
                    <Label htmlFor="weekStart">Week Starts On</Label>
                    <Select defaultValue="monday">
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Sunday</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              {/* Business Settings Card Footer */}
              <CardFooter>
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure automated email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Student Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Send welcome email when new students are registered
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Class Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send class reminders 24 hours before scheduled classes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Attendance Alert</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify parents when students are marked absent
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Receipt</Label>
                    <p className="text-sm text-muted-foreground">
                      Send receipt when payment is completed
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send payment reminder 3 days before due date
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>

            {/* SMS Notifications Tab */}
            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Configure automated SMS notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Class Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS reminder 2 hours before class
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Emergency Closure</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify all users when school is closed unexpectedly
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Payment Due</Label>
                    <p className="text-sm text-muted-foreground">
                      SMS reminder on payment due date
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save SMS Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Branches Settings Tab */}
          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branch Management</CardTitle>
                <CardDescription>
                  Configure branch settings and locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Branch management content will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Security settings content will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Configure third-party service integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Integration settings content will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
