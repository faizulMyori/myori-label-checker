import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";

export type UserContextType = {
  user: null | undefined;
  setUser: React.Dispatch<React.SetStateAction<null | undefined>>;
  conn: "failed" | "connecting" | "connected" | "idle";
  setConn: React.Dispatch<React.SetStateAction<"idle" | "connecting" | "connected" | "failed" | "disconnecting">>;
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
};

export const UserContext = React.createContext<UserContextType | null>(null);

export default function App() {
  const [user, setUser] = useState<null | undefined>(null);
  const [conn, setConn] = useState("failed");
  const [route, setRoute] = useState("");
  const { i18n } = useTranslation();

  useEffect(() => {
    syncThemeWithLocal();
    updateAppLanguage(i18n);
  }, [i18n]);

  useEffect(() => {
    const handleConnection = async () => {
      try {
        const resp: any = await window.sqlite.get_connections();
        if (resp) {
          setConn("connecting");
          try {
            await window.tcpConnection.tcp_connect({ ip: resp.ip, port: resp.port });
            await window.serial.serial_com_open({ com: resp.com })
            setConn("connected");
          } catch {
            setConn("failed");
          }
        } else {
          setConn("failed");
        }
      } catch {
        setConn("failed");
      }
    };
    handleConnection();
    window.tcpConnection.tcp_closed(renderConnectionStatus);
  }, []);

  const renderConnectionStatus = useCallback(() => {
    setConn("idle");
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, conn, setConn, route, setRoute } as UserContextType}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

