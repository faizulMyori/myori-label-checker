import React from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";

export default function InventoryPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-2">

      </div>
      <Footer />
    </div>
  );
}
