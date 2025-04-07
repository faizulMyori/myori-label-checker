"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import React from "react"

export default function CapturedData() {
  const { capturedData, handleDownload } = useProduction()

  return (
    <Card className="col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">READING CAPTURED DATA</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{capturedData.length}</div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload("captured")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] overflow-y-auto">
        {[...capturedData].reverse().map((item: any, index: number) => (
          <div key={index} className="text-sm">
            {`${item.serial}, ${item.url}, ${item.status}`}
          </div>
        ))}
        {capturedData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No captured serial numbers</div>
        )}
      </CardContent>
    </Card>
  )
}

