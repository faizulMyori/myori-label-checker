import { Moon } from "lucide-react";
import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { FormDialog } from "./FormDialog";
import { UserContext } from "@/App";
import { ConfirmDialog } from "./ConfirmDialog";

export default function LogoutToggle() {
  const [openLogout, setOpenLogout] = useState(false);
  const { user, setUser }: any = useContext(UserContext);

  const toggleLogout = () => {
    console.log('masuk')

    setOpenLogout(!openLogout);
  };

  const handleSubmit = async () => {
    setUser(null)
  };

  return (
    <>
      <Button variant="destructive" onClick={toggleLogout}>
        Logout
      </Button>

      {
        openLogout && (
          <ConfirmDialog
            open={openLogout}
            setConfirm={handleSubmit}
            title="Confirm to logout?"
            setOpen={setOpenLogout}
          />
        )
      }

    </>
  );
}

