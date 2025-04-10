
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, PaintBucket, ToggleLeft, Shield, Bell, Gauge, LineChart, CreditCard, HardDrive, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";

export function AppSettingsTab() {
  const { toast } = useToast();
  const { settings, updateSetting, isLoading } = useAppSettings();
  const [activeTab, setActiveTab] = useState("branding");

  const handleSettingUpdate = async (key: string, value: string) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({
        title: "Setting updated",
        description: "The setting has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">App Settings</h2>
          <p className="text-muted-foreground">
            Configure and manage global application settings
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="branding"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingSettings settings={settings} onUpdateSetting={handleSettingUpdate} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="features">
          <FeatureSettings settings={settings} onUpdateSetting={handleSettingUpdate} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings settings={settings} onUpdateSetting={handleSettingUpdate} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings settings={settings} onUpdateSetting={handleSettingUpdate} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings settings={settings} onUpdateSetting={handleSettingUpdate} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SettingsSectionProps {
  settings: Record<string, string>;
  onUpdateSetting: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
}

function BrandingSettings({ settings, onUpdateSetting, isLoading }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Settings</CardTitle>
        <CardDescription>
          Customize the appearance and branding of your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingItem
          title="Application Name"
          description="The name displayed in the header and page titles"
          settingKey="app_name"
          defaultValue="PicoCareer"
          currentValue={settings.app_name}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="text"
        />
        <SettingItem
          title="Primary Color"
          description="Main color theme for the application"
          settingKey="primary_color"
          defaultValue="#9b87f5"
          currentValue={settings.primary_color}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="color"
        />
        <SettingItem
          title="Secondary Color"
          description="Secondary accent color for the application"
          settingKey="secondary_color"
          defaultValue="#7E69AB"
          currentValue={settings.secondary_color}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="color"
        />
        <SettingItem
          title="Logo URL"
          description="URL to the application logo image"
          settingKey="logo_url"
          defaultValue="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png"
          currentValue={settings.logo_url}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="text"
        />
        <SettingItem
          title="Favicon URL"
          description="URL to the browser tab icon"
          settingKey="favicon_url"
          defaultValue="/favicon.ico"
          currentValue={settings.favicon_url}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="text"
        />
      </CardContent>
    </Card>
  );
}

function FeatureSettings({ settings, onUpdateSetting, isLoading }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Settings</CardTitle>
        <CardDescription>
          Enable or disable application features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingItem
          title="Mentor Registration"
          description="Allow users to register as mentors"
          settingKey="enable_mentor_registration"
          defaultValue="true"
          currentValue={settings.enable_mentor_registration}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Career Chat"
          description="Enable the AI career chat assistant"
          settingKey="enable_career_chat"
          defaultValue="true"
          currentValue={settings.enable_career_chat}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Blog"
          description="Enable the blog feature"
          settingKey="enable_blog"
          defaultValue="true"
          currentValue={settings.enable_blog}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Hubs"
          description="Enable community hubs feature"
          settingKey="enable_hubs"
          defaultValue="true"
          currentValue={settings.enable_hubs}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Events"
          description="Enable events feature"
          settingKey="enable_events"
          defaultValue="true"
          currentValue={settings.enable_events}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
      </CardContent>
    </Card>
  );
}

function SecuritySettings({ settings, onUpdateSetting, isLoading }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure security and access control settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingItem
          title="Email Verification Required"
          description="Users must verify email before accessing features"
          settingKey="require_email_verification"
          defaultValue="true"
          currentValue={settings.require_email_verification}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Maximum Login Attempts"
          description="Number of login attempts before temporary lockout"
          settingKey="max_login_attempts"
          defaultValue="5"
          currentValue={settings.max_login_attempts}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="number"
        />
        <SettingItem
          title="Minimum Password Length"
          description="Minimum length for user passwords"
          settingKey="min_password_length"
          defaultValue="8"
          currentValue={settings.min_password_length}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="number"
        />
        <SettingItem
          title="Session Timeout (minutes)"
          description="Time until user is automatically logged out"
          settingKey="session_timeout_minutes"
          defaultValue="120"
          currentValue={settings.session_timeout_minutes}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="number"
        />
      </CardContent>
    </Card>
  );
}

function NotificationSettings({ settings, onUpdateSetting, isLoading }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure system-wide notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingItem
          title="Email Notifications"
          description="Enable system email notifications"
          settingKey="enable_email_notifications"
          defaultValue="true"
          currentValue={settings.enable_email_notifications}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Welcome Email"
          description="Send welcome email to new users"
          settingKey="send_welcome_email"
          defaultValue="true"
          currentValue={settings.send_welcome_email}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Session Reminders"
          description="Send reminders for upcoming mentor sessions"
          settingKey="send_session_reminders"
          defaultValue="true"
          currentValue={settings.send_session_reminders}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Reminder Time (hours)"
          description="How many hours before a session to send reminder"
          settingKey="reminder_hours_before"
          defaultValue="24"
          currentValue={settings.reminder_hours_before}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="number"
        />
      </CardContent>
    </Card>
  );
}

function SystemSettings({ settings, onUpdateSetting, isLoading }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure system-wide operational settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingItem
          title="Maintenance Mode"
          description="Put the application in maintenance mode"
          settingKey="maintenance_mode"
          defaultValue="false"
          currentValue={settings.maintenance_mode}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Default Timezone"
          description="System default timezone for new users"
          settingKey="default_timezone"
          defaultValue="UTC"
          currentValue={settings.default_timezone}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="text"
        />
        <SettingItem
          title="Default Language"
          description="System default language"
          settingKey="default_language"
          defaultValue="en-US"
          currentValue={settings.default_language}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="text"
        />
        <SettingItem
          title="Debug Mode"
          description="Enable application debug mode"
          settingKey="debug_mode"
          defaultValue="false"
          currentValue={settings.debug_mode}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
        <SettingItem
          title="Analytics Tracking"
          description="Enable usage analytics tracking"
          settingKey="enable_analytics"
          defaultValue="true"
          currentValue={settings.enable_analytics}
          onUpdate={onUpdateSetting}
          isLoading={isLoading}
          type="toggle"
        />
      </CardContent>
    </Card>
  );
}

interface SettingItemProps {
  title: string;
  description: string;
  settingKey: string;
  defaultValue: string;
  currentValue?: string;
  onUpdate: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
  type: "text" | "number" | "toggle" | "color" | "select";
  options?: { label: string; value: string }[];
}

function SettingItem({
  title,
  description,
  settingKey,
  defaultValue,
  currentValue,
  onUpdate,
  isLoading,
  type,
  options,
}: SettingItemProps) {
  const [value, setValue] = useState(currentValue || defaultValue);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdate = async () => {
    if (value !== currentValue) {
      setIsUpdating(true);
      await onUpdate(settingKey, value);
      setIsUpdating(false);
    }
  };

  // Render different input types based on the 'type' prop
  const renderInput = () => {
    switch (type) {
      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={settingKey}
              checked={value === "true"}
              onChange={(e) => setValue(e.target.checked ? "true" : "false")}
              className="rounded border-gray-300 text-primary focus:ring-primary"
              disabled={isLoading || isUpdating}
            />
            <label htmlFor={settingKey} className="text-sm font-medium">
              {value === "true" ? "Enabled" : "Disabled"}
            </label>
          </div>
        );
      case "color":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id={settingKey}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 w-16 rounded border border-gray-300"
              disabled={isLoading || isUpdating}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || isUpdating}
            />
          </div>
        );
      case "number":
        return (
          <input
            type="number"
            id={settingKey}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isUpdating}
          />
        );
      case "select":
        return (
          <select
            id={settingKey}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isUpdating}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default: // text
        return (
          <input
            type="text"
            id={settingKey}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isUpdating}
          />
        );
    }
  };

  return (
    <div className="border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-0.5">
          <label htmlFor={settingKey} className="text-sm font-medium">
            {title}
          </label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {renderInput()}
          <button
            onClick={handleUpdate}
            disabled={isLoading || isUpdating || value === currentValue}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3 py-2"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
