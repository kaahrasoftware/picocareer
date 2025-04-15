import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AccessibilitySettings } from "./types";
interface NavigationSectionProps {
  settings: AccessibilitySettings;
  handleToggle: (key: keyof AccessibilitySettings, value: boolean) => void;
}
export function NavigationSection({
  settings,
  handleToggle
}: NavigationSectionProps) {
  return;
}