import React, { useContext, useEffect } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu as NavigationMenuBase,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { cn } from "@/utils/tailwind";
import ToggleTheme from "../ToggleTheme";
import { UserContext } from "@/App";

export default function NavigationMenu() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<string>("/");
  const { user, setUser, route, setRoute }: any = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setActiveTab("/");
      setRoute("/");
    }
  }, [user])

  useEffect(() => {
    setActiveTab(route);
  }, [route])

  return (
    <NavigationMenuBase className="px-2 font-mono text-muted-foreground">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => {
            setActiveTab("/")
            setRoute("/")
            navigate({ to: "/" })
          }} className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/" })} >
            {t("titleHomePage")}
          </NavigationMenuLink>
        </NavigationMenuItem>
        {
          user &&
          <>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={() => {
                setActiveTab("/inventory");
                setRoute("/inventory");
                navigate({ to: "/inventory" })
              }} className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/inventory" })}>
                {t("titleInventoryPage")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={() => {
                setActiveTab("/license");
                setRoute("/license");
                navigate({ to: "/license" })
              }} className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/license" })}>
                {t("titleLicensePage")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={() => {
                setActiveTab("/production");
                setRoute("/production");
                navigate({ to: "/production" })
              }} className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/production" })}>
                {t("titleProductionPage")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={() => {
                setActiveTab("/history");
                setRoute("/history");
                navigate({ to: "/history" })
              }} className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/history" })}>
                {t("titleHistoryPage")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink onClick={() => {
                setActiveTab("/setting");
                setRoute("/setting");
                navigate({ to: "/setting" })
              }} className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/setting" })}>
                {t("titleSettingPage")}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        }
      </NavigationMenuList>
    </NavigationMenuBase>
  );
}
