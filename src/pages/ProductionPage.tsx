"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RefreshCcw, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import React from "react"

type ProductionStatus = "NOT READY" | "RUNNING" | "STOPPED"
type ProductionData = { timestamp: string; value: number }
type RejectData = { id: string; reason: string; timestamp: string }

export default function ProductionDashboard() {
  // State management
  const [status, setStatus] = useState<ProductionStatus>("NOT READY")
  const [isLoading, setIsLoading] = useState(false)
  const [productionData, setProductionData] = useState<ProductionData[]>([])
  const [capturedData, setCapturedData] = useState<ProductionData[]>([])
  const [autoRejectData, setAutoRejectData] = useState<RejectData[]>([])
  const [missingData, setMissingData] = useState<number>(0)
  const [duplicateData, setDuplicateData] = useState<number>(0)
  const [manualRejectData, setManualRejectData] = useState<RejectData[]>([])
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({
    missing: false,
    duplicate: false,
  })

  // Simulate real-time data updates
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === "RUNNING") {
      interval = setInterval(() => {
        // Update production data
        setProductionData((prev) =>
          [...prev, { timestamp: new Date().toISOString(), value: Math.random() * 100 }].slice(-10),
        )

        // Update captured data
        setCapturedData((prev) =>
          [...prev, { timestamp: new Date().toISOString(), value: Math.random() * 100 }].slice(-10),
        )

        // Randomly add reject data
        if (Math.random() > 0.7) {
          setAutoRejectData((prev) =>
            [
              ...prev,
              {
                id: Math.random().toString(36).slice(2),
                reason: "Quality threshold not met",
                timestamp: new Date().toISOString(),
              },
            ].slice(-5),
          )
        }

        // Update missing and duplicate counts
        setMissingData((prev) => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)))
        setDuplicateData((prev) => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)))
      }, 2000)
    }

    return () => clearInterval(interval)
  }, [status])

  // Production control handlers
  const handleEnterProduction = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    setStatus("NOT READY")
    setIsLoading(false)
  }

  const handleStartProduction = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    setStatus("RUNNING")
    setIsLoading(false)
  }

  const handleStopProduction = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    setStatus("STOPPED")
    setIsLoading(false)
  }

  // Refresh handlers
  const handleRefresh = async (type: "missing" | "duplicate") => {
    setRefreshing((prev) => ({ ...prev, [type]: true }))
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    if (type === "missing") setMissingData(0)
    if (type === "duplicate") setDuplicateData(0)
    setRefreshing((prev) => ({ ...prev, [type]: false }))
  }

  // Add manual reject entry
  const handleAddManualReject = () => {
    setManualRejectData((prev) =>
      [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          reason: "Manual quality check failed",
          timestamp: new Date().toISOString(),
        },
      ].slice(-5),
    )
  }

  return (
    <div className="mx-auto p-4 space-y-4">
      {/* Top Controls */}
      <span className="text-2xl font-semibold leading-none tracking-tight">Production</span>
      <div className="flex flex-wrap gap-4 items-center justify-between pt-4">
        <div className="flex flex-wrap gap-4">
          <Button
            variant="default"
            className="bg-[#1B3B5C] hover:bg-[#1B3B5C]/90 text-white"
            onClick={handleEnterProduction}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enter Production
          </Button>
          <Button variant="secondary" onClick={handleStartProduction} disabled={isLoading || status === "RUNNING"}>
            Start Production
          </Button>
          <Button variant="secondary" onClick={handleStopProduction} disabled={isLoading || status === "STOPPED"}>
            Stop Production
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Status:</span>
          <span
            className={`font-bold ${status === "RUNNING" ? "text-green-600" : status === "STOPPED" ? "text-red-600" : "text-yellow-600"
              }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Production Data */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold">PRODUCTION DATA</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px] space-y-2">
            {productionData.map((data, index) => (
              <div key={index} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
                <span>{data.value.toFixed(2)}</span>
              </div>
            ))}
            {productionData.length === 0 && (
              <Alert>
                <AlertDescription>No production data available</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Reading Captured Data */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg font-bold">READING CAPTURED DATA</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px] space-y-2">
            {capturedData.map((data, index) => (
              <div key={index} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
                <span>{data.value.toFixed(2)}</span>
              </div>
            ))}
            {capturedData.length === 0 && (
              <Alert>
                <AlertDescription>No captured data available</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Auto-Reject Data */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold">AUTO-REJECT DATA</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px] space-y-2">
            {autoRejectData.map((data) => (
              <div key={data.id} className="text-sm p-2 bg-red-100 dark:bg-red-900/20 rounded">
                <div className="font-medium">ID: {data.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{data.reason}</div>
                <div className="text-xs text-muted-foreground">{new Date(data.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            {autoRejectData.length === 0 && (
              <Alert>
                <AlertDescription>No auto-reject data available</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Missing Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">MISSING DATA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-2xl font-bold">{missingData}</div>
            <div className="flex justify-center">
              <Button
                variant="default"
                className="bg-[#1B3B5C] hover:bg-[#1B3B5C]/90"
                onClick={() => handleRefresh("missing")}
                disabled={refreshing.missing}
              >
                {refreshing.missing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">DUPLICATE DATA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-2xl font-bold">{duplicateData}</div>
            <div className="flex justify-center">
              <Button
                variant="default"
                className="bg-[#1B3B5C] hover:bg-[#1B3B5C]/90"
                onClick={() => handleRefresh("duplicate")}
                disabled={refreshing.duplicate}
              >
                {refreshing.duplicate ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual-Reject Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">MANUAL-REJECT DATA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {manualRejectData.map((data) => (
                <div key={data.id} className="text-sm p-2 bg-muted/50 rounded">
                  <div className="font-medium">ID: {data.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(data.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="secondary" onClick={handleAddManualReject}>
                ADD ENTRY
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

