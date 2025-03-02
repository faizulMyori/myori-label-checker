import { useState } from "react"
import { Plus, Check, RefreshCcw, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import Footer from "@/components/template/Footer"

// Mock product data
const mockProducts = [
  { sku: "PRD001", name: "Product A" },
  { sku: "PRD002", name: "Product B" },
  { sku: "PRD003", name: "Product C" },
  { sku: "PRD004", name: "Product D" },
  { sku: "PRD005", name: "Product E" },
]

// Mock captured data
const mockCapturedData = [
  { id: "TA000001", url: "https://urls.com" },
  { id: "TA000002", url: "https://urls.com" },
  { id: "TA000004", url: "https://urls.com" },
  { id: "TA000010", url: "https://urls.com" },
  { id: "REJECT00001", status: "ERROR" },
  { id: "TA000012", url: "https://urls.com" },
  { id: "TA000012", url: "https://urls.com" },
]

// Mock reject data
const mockRejectData = [
  { id: "REJECT00001", status: "ERROR" },
  { id: "REJECT00002", status: "ERROR" },
]

type LabelRoll = {
  id: string
  rollNumber: string
  startNumber: string
  endNumber: string
  verified: boolean
}

type ProductionData = {
  date: string
  batchNo: string
  product: string
  labelRolls: LabelRoll[]
}

type ManualRejectEntry = {
  id: string
  serialNumber: string
}

// Mock fetchProducts function
const fetchProducts = async () => {
  // Simulate fetching products from an API
  return new Promise<{ sku: string; name: string }[]>((resolve) => {
    setTimeout(() => {
      resolve(mockProducts)
    }, 500)
  })
}

export default function ProductionPage() {
  const [open, setOpen] = useState(false)
  const [batchNo, setBatchNo] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [labelRolls, setLabelRolls] = useState<LabelRoll[]>([
    { id: "1", rollNumber: "1", startNumber: "", endNumber: "", verified: false },
  ])
  const [products, setProducts] = useState<{ sku: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [productionStatus, setProductionStatus] = useState<"IDLE" | "RUNNING" | "STOPPED">("IDLE")
  const [savedProduction, setSavedProduction] = useState<ProductionData | null>(null)
  const [manualRejectEntries, setManualRejectEntries] = useState<ManualRejectEntry[]>([])
  const [isManualRejectModalOpen, setIsManualRejectModalOpen] = useState(false)
  const [newSerialNumber, setNewSerialNumber] = useState("")

  // Get today's date formatted
  const today = new Date().toISOString().split("T")[0]

  // Calculate total labels
  const calculateTotalLabels = () => {
    return labelRolls.reduce((total, roll) => {
      if (roll.verified && roll.startNumber && roll.endNumber) {
        const start = Number.parseInt(roll.startNumber)
        const end = Number.parseInt(roll.endNumber)
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          return total + (end - start + 1)
        }
      }
      return total
    }, 0)
  }

  // Add new label roll
  const addLabelRoll = () => {
    const newRollNumber = (labelRolls.length + 1).toString()
    setLabelRolls([
      ...labelRolls,
      {
        id: newRollNumber,
        rollNumber: newRollNumber,
        startNumber: "",
        endNumber: "",
        verified: false,
      },
    ])
  }

  // Update label roll
  const updateLabelRoll = (id: string, field: keyof LabelRoll, value: string | boolean) => {
    setLabelRolls(labelRolls.map((roll) => (roll.id === id ? { ...roll, [field]: value } : roll)))
  }

  // Verify label roll
  const verifyLabelRoll = (id: string) => {
    const roll = labelRolls.find((r) => r.id === id)
    if (roll && roll.rollNumber && roll.startNumber && roll.endNumber) {
      const start = Number.parseInt(roll.startNumber)
      const end = Number.parseInt(roll.endNumber)
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        updateLabelRoll(id, "verified", true)
      }
    }
  }

  // Load products when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && products.length === 0) {
      setLoading(true)
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  // Save production data
  const saveProduction = () => {
    const productData = {
      date: today,
      batchNo,
      product: selectedProduct,
      labelRolls,
    }
    setSavedProduction(productData)
    setOpen(false)
  }

  // Start production
  const startProduction = () => {
    setProductionStatus("RUNNING")
  }

  // Stop production
  const stopProduction = () => {
    setProductionStatus("STOPPED")
  }

  const addManualRejectEntry = () => {
    if (newSerialNumber.trim()) {
      setManualRejectEntries([
        ...manualRejectEntries,
        { id: Date.now().toString(), serialNumber: newSerialNumber.trim() },
      ])
      setNewSerialNumber("")
      setIsManualRejectModalOpen(false)
    }
  }

  const handleDownload = (section: string) => {
    // Implement download logic here
    console.log(`Downloading ${section} data`)
  }

  return (
    <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
      <div className="flex flex-1 flex-col gap-2 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Production</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Management</CardTitle>
              <CardDescription>Manage and monitor production batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="lg">
                          Enter Production
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>New Production Batch</DialogTitle>
                          <DialogDescription>Enter the production details and label roll information</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="productionDate" className="text-right">
                              Production Date
                            </Label>
                            <Input id="productionDate" value={today} readOnly className="col-span-3 bg-muted" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batchNo" className="text-right">
                              Batch No.
                            </Label>
                            <Input
                              id="batchNo"
                              value={batchNo}
                              onChange={(e) => setBatchNo(e.target.value)}
                              className="col-span-3"
                              placeholder="Enter batch number"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product" className="text-right">
                              Product
                            </Label>
                            <div className="col-span-3">
                              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {loading ? (
                                    <SelectItem value="loading" disabled>
                                      Loading products...
                                    </SelectItem>
                                  ) : (
                                    products.map((product) => (
                                      <SelectItem key={product.sku} value={product.sku}>
                                        {product.sku} - {product.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <Label>Label Rolls</Label>
                              <Button type="button" variant="outline" size="sm" onClick={addLabelRoll}>
                                <Plus className="h-4 w-4 mr-1" /> Add Roll
                              </Button>
                            </div>

                            {labelRolls.map((roll) => (
                              <div key={roll.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <div className="col-span-3">
                                  <Input
                                    placeholder="Roll #"
                                    value={roll.rollNumber}
                                    readOnly
                                    className="bg-muted"
                                    disabled={roll.verified}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    placeholder="Start #"
                                    value={roll.startNumber}
                                    onChange={(e) => updateLabelRoll(roll.id, "startNumber", e.target.value)}
                                    disabled={roll.verified}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    placeholder="End #"
                                    value={roll.endNumber}
                                    onChange={(e) => updateLabelRoll(roll.id, "endNumber", e.target.value)}
                                    disabled={roll.verified}
                                  />
                                </div>
                                <div className="col-span-3 flex justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={roll.verified ? "default" : "outline"}
                                    onClick={() => verifyLabelRoll(roll.id)}
                                    disabled={roll.verified}
                                  >
                                    <Check className="h-4 w-4" />
                                    {roll.verified ? "Verified" : "Check"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4 mt-4">
                            <Label className="text-right font-semibold">Estimated Total Labels:</Label>
                            <div className="col-span-3 font-bold text-lg">{calculateTotalLabels().toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="button" onClick={saveProduction}>
                            Save Production Batch
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="lg"
                      className="bg-green-700 hover:bg-green-600"
                      disabled={!savedProduction || productionStatus === "RUNNING"}
                      onClick={startProduction}
                    >
                      Start Production
                    </Button>
                    <Button
                      size="lg"
                      className="bg-slate-700 hover:bg-slate-600"
                      disabled={productionStatus !== "RUNNING"}
                      onClick={stopProduction}
                    >
                      Stop Production
                    </Button>
                  </div>
                  <div
                    className={`text-lg font-semibold ${productionStatus === "RUNNING"
                      ? "text-green-500"
                      : productionStatus === "STOPPED"
                        ? "text-red-500"
                        : "text-gray-500"
                      }`}
                  >
                    Status: {productionStatus}
                  </div>
                </div>

                {/* Production Data Display */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Production Data */}
                  <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">PRODUCTION DATA</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {savedProduction ? (
                        <>
                          <div>
                            <Label>Production Date:</Label>
                            <div>{savedProduction.date}</div>
                          </div>
                          <div>
                            <Label>Brand - Model:</Label>
                            <div>{savedProduction.product}</div>
                          </div>
                          <div>
                            <Label>Batch No.</Label>
                            <div>{savedProduction.batchNo}</div>
                          </div>
                          <div>
                            <Label>Labels Qty:</Label>
                            <div>{calculateTotalLabels().toLocaleString()}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground">No production data</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reading Captured Data */}
                  <Card className="col-span-5">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">READING CAPTURED DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{mockCapturedData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("captured")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {mockCapturedData.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.url ? (
                            `${item.id}, ${item.url}`
                          ) : (
                            <span className="text-red-500">{`${item.id}, ${item.status}`}</span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Auto-Reject Data */}
                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">AUTO-REJECT DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{mockRejectData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("auto-reject")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {mockRejectData.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item.id}, ${item.status}`}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Bottom Row */}
                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">MISSING DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">1</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("missing")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm mb-4">TA000003</div>
                      <Button variant="secondary" size="sm">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">DUPLICATE DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">1</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("duplicate")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm mb-4">TA000012</div>
                      <Button variant="secondary" size="sm">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">MANUAL-REJECT DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{manualRejectEntries.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("manual-reject")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {manualRejectEntries.map((entry) => (
                          <div key={entry.id} className="text-sm">
                            {entry.serialNumber}
                          </div>
                        ))}
                      </div>
                      <Dialog open={isManualRejectModalOpen} onOpenChange={setIsManualRejectModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="mt-4">
                            ADD ENTRY
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add Manual Reject Entry</DialogTitle>
                            <DialogDescription>Enter the serial number for the manual reject entry.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="serialNumber" className="text-right">
                                Serial Number
                              </Label>
                              <Input
                                id="serialNumber"
                                value={newSerialNumber}
                                onChange={(e) => setNewSerialNumber(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button type="button" onClick={addManualRejectEntry}>
                              Add Entry
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

