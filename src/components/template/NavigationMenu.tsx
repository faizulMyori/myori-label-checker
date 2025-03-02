import React, { useContext, useEffect } from "react";
import { Link } from "@tanstack/react-router";
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
          <Link to="/" onClick={() => {
            setActiveTab("/");
            setRoute("/");
          }}>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/" })} >
              {t("titleHomePage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {
          user &&
          <>
            <NavigationMenuItem>
              <Link to="/inventory" onClick={() => {
                setActiveTab("/inventory");
                setRoute("/inventory");
              }}>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/inventory" })}>
                  {t("titleInventoryPage")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/license" onClick={() => {
                setActiveTab("/license");
                setRoute("/license");
              }}>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/license" })}>
                  {t("titleLicensePage")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/production" onClick={() => {
                setActiveTab("/production");
                setRoute("/production");
              }}>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/production" })}>
                  {t("titleProductionPage")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/history" onClick={() => {
                setActiveTab("/history");
                setRoute("/history");
              }}>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/history" })}>
                  {t("titleHistoryPage")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/setting" onClick={() => {
                setActiveTab("/setting");
                setRoute("/setting");
              }}>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "group", { "bg-accent text-accent-foreground": activeTab === "/setting" })}>
                  {t("titleSettingPage")}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        }
      </NavigationMenuList>
    </NavigationMenuBase>
  );
}
