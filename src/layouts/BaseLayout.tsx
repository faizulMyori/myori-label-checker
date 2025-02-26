import React, { useContext } from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import NavigationMenu from "@/components/template/NavigationMenu";
import ToggleTheme from "@/components/ToggleTheme";
import LoginToggle from "@/components/LoginToggle";
import { UserContext } from "@/App";
import LogoutToggle from "@/components/LogoutToggle";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, setUser }: any = useContext(UserContext);

  return (
    <>
      <DragWindowRegion title="MyORI Label Checker" />
      <div className="flex">
        <div className="w-2/3">
          <NavigationMenu />
        </div>
        <div className="w-1/3 flex items-center justify-end p-2 gap-2">
          {

            user ? <LogoutToggle /> : <LoginToggle />
          }
          <ToggleTheme />
        </div>
      </div>
      <main className="h-screen pb-20 p-2">{children}</main>
    </>
  );
}
