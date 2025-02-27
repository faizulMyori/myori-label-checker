import React from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";
import { Separator } from "@radix-ui/react-select";
import { Link } from "@tanstack/react-router";

export default function SettingPage({ children }: { children: React.ReactNode }) {
  const currentPath = window.location.pathname;

  const { t } = useTranslation();
  const sidebarNavItems: any = [
    {
      title: 'Connection',
      url: '/connection',
      icon: null,
    },
    {
      title: 'Appearance',
      url: '/settings/appearance',
      icon: null,
    },
  ];
  return (
    <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
      <div className="flex flex-1 flex-col gap-2 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        <div className="px-4 py-6">

          <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
            <aside className="w-full max-w-xl lg:w-48">
              <nav className="flex flex-col space-y-1 space-x-0">
                {sidebarNavItems.map((item: any) => (
                  <Button
                    key={item.url}
                    size="sm"
                    variant="ghost"
                    asChild
                    className={cn('w-full justify-start', {
                      'bg-muted': currentPath === item.url,
                    })}
                  >
                    <Link to={item.url}>
                      {item.title}
                    </Link>
                  </Button>
                ))}
              </nav>
            </aside>

            <Separator className="my-6 md:hidden" />

            <div className="flex-1 md:max-w-2xl">
              <section className="max-w-xl space-y-12">{children}</section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
