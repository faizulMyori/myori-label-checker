import React from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";

export default function SettingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-1 flex-col gap-2">
        <span className="text-2xl font-semibold leading-none tracking-tight pt-8">Settings</span>

      </div>
      <Footer />
    </div>
  );
}
