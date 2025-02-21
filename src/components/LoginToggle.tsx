import { Moon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { FormDialog } from "./ui/FormDialog";

export default function LoginToggle() {
  const [openLogin, setOpenLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const toggleLogin = () => {
    setOpenLogin(!openLogin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call your login API here
    console.log(form);
  };

  return (
    <>
      <Button onClick={toggleLogin}>
        Login
      </Button>

      {
        openLogin && (
          <FormDialog
            setOpenForm={setOpenLogin}
            openDialog={openLogin}
            setConfirmForm={handleSubmit}
            title={`Login`}
            forms={<Form data={form} setData={setForm} />}
            processing={false}
          />
        )
      }

    </>
  );
}

function Form({ data, setData }: { data: any; setData: any }) {
  function updateInputValue(evt: any) {
    const val = evt.target.value;

    setData({
      ...data,
      [evt.target.id]: val,
    });
  }

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          placeholder="Enter your username"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.username ?? ""}
        />
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input
          id="password"
          placeholder="Enter your password"
          className="col-span-3"
          type="password"
          onChange={updateInputValue}
          value={data.password ?? ""}
        />
      </div>
    </>
  );
}

