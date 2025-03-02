import { useCallback, useContext, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import React from "react"
import { UserContext } from "@/App"

export default function ConnectionPage() {
    const [host, setHost] = useState("")
    const [port, setPort] = useState("")
    const { conn, setConn }: any = useContext(UserContext);
    const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "failed" | "disconnecting">(conn)

    const handleConnect = () => {
        setConnectionStatus("connecting")
        setConn("connecting")
        window.sqlite.create_connection(host, port).then(() => {
            window.tcpConnection.tcp_connect({ ip: host, port: port }).then((data: any) => {
                setConnectionStatus("connected")
                setConn("connected")
            }).catch((err: any) => {
                if (err) {
                    setConnectionStatus("failed")
                    setConn("failed")
                }
            })
        })
    }

    const handleDisconnect = () => {
        setConnectionStatus("disconnecting")
        setConn("disconnecting")
        window.tcpConnection.tcp_disconnect().then((data: any) => {
            setConnectionStatus("idle")
            setConn("disconnecting")
        }).catch((err: any) => {
            setConnectionStatus("idle")
            setConn("disconnecting")
        })
    }

    useEffect(() => {
        window.sqlite.get_connections().then((resp: any) => {
            if (resp) {
                setHost(resp.ip)
                setPort(resp.port)
            } else {
                setConnectionStatus("failed")
                setConn("failed")
            }
        })

        window.tcpConnection.tcp_closed(renderConnectionStatus)
    }, [])

    const renderConnectionStatus = useCallback(() => {
        setConnectionStatus("idle")
        setConn("idle")
    }, [connectionStatus])

    return (
        <Card>
            <CardHeader>
                <CardTitle>TCP/IP Connection</CardTitle>
                <CardDescription>Configure your TCP/IP connection settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="host">Host / IP Address</Label>
                        <Input id="host" placeholder="192.168.1.1" value={host} onChange={(e) => setHost(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" placeholder="8080" type="number" value={port} onChange={(e) => setPort(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="connection-type">Connection Type</Label>
                    <Select defaultValue="tcp">
                        <SelectTrigger id="connection-type">
                            <SelectValue placeholder="Select connection type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tcp">TCP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {connectionStatus === "connected" ? (
                    <div className="flex items-center text-green-500">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span>Connected</span>
                    </div>
                ) : connectionStatus === "failed" ? (
                    <div className="flex items-center text-red-500">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Connection failed</span>
                    </div>
                ) : connectionStatus === "connecting" ? (
                    <div className="flex items-center text-blue-500">
                        <span>Connecting...</span>
                    </div>
                ) : connectionStatus === 'disconnecting' ? (
                    <div className="flex items-center text-blue-500">
                        <span>Disconnecting...</span>
                    </div>
                ) : (
                    <div className="flex items-center text-muted-foreground">
                        <span>Not connected</span>
                    </div>
                )}

                {connectionStatus === "connected" ? (
                    <Button variant="destructive" onClick={handleDisconnect}>
                        Disconnect
                    </Button>
                ) : connectionStatus === "connecting" ? (
                    <Button disabled>Connecting...</Button>
                ) : (
                    <Button onClick={handleConnect} disabled={!host || !port || connectionStatus === "disconnecting"}>Connect</Button>
                )}
            </CardFooter>
        </Card>
    )
}

