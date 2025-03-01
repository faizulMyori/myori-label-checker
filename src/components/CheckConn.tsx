import { MonitorCheck, MonitorCog, MonitorDot, MonitorDown, Moon } from "lucide-react";
import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/helpers/theme_helpers";
import { UserContext } from "@/App";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from "@tanstack/react-router";

export default function CheckConn() {
  const { conn, setConn, user, route, setRoute }: any = useContext(UserContext);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link to={user ? "/setting" : "/"} onClick={() => setRoute(user ? "/setting" : "/")}>
            {conn === "connected" && (<MonitorCheck className="h-8 w-8 text-green-500" />)}
            {conn === "failed" && (<MonitorDown className="h-8 w-8 text-red-500" />)}
            {conn === "connecting" && (<MonitorCog className="h-8 w-8 animate-spin" />)}
            {conn === "idle" && (<MonitorDot className="h-8 w-8" />)}
            {conn === "disconnecting" && (<MonitorCog className="h-8 w-8 animate-spin" />)}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{conn.toUpperCase()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
