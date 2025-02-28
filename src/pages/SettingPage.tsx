import React from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";
import { Separator } from "@radix-ui/react-select";
import { Link } from "@tanstack/react-router";
import SettingLayout from "@/layouts/SettingLayout";
import ConnectionPage from "./settings/ConnectionPage";
import UserManagementPage from "./settings/UserManagementPage";

export default function SettingPage() {
  const [nav, setNav] = React.useState('connection');
  return (
    <SettingLayout nav={nav} setNav={setNav}>
      {
        nav === 'connection' && (
          <div className="flex-1">
            <ConnectionPage />
          </div>
        )
      }

      {
        nav === 'user management' && (
          <UserManagementPage />
        )
      }
    </SettingLayout>
  )
}