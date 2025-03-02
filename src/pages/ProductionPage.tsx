import { useCallback, useEffect, useState } from "react"
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

export default function ProductionPage() {
  const [capturedData, setCapturedData] = useState([] as any[])
  const [duplicatedData, setDuplicatedData] = useState([] as any[])
  const [missingData, setMissingData] = useState([] as any[])
  const [open, setOpen] = useState(false)
  const [batchNo, setBatchNo] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [labelRolls, setLabelRolls] = useState<LabelRoll[]>([
    { id: "1", rollNumber: "1", startNumber: "", endNumber: "", verified: false },
  ])
  const [products, setProducts] = useState([] as any[])
  const [loading, setLoading] = useState(false)
  const [productionStatus, setProductionStatus] = useState<"IDLE" | "RUNNING" | "STOPPED">("IDLE")
  const [savedProduction, setSavedProduction] = useState<ProductionData | null>(null)
  const [manualRejectEntries, setManualRejectEntries] = useState<ManualRejectEntry[]>([])
  const [isManualRejectModalOpen, setIsManualRejectModalOpen] = useState(false)
  const [newSerialNumber, setNewSerialNumber] = useState("")
  const [productData, setProductData] = useState({
    id: "",
    sku: "",
    brand: "",
    model: "",
    type: "",
    rating: "",
    size: "",
  })
  // Get today's date formatted
  const today = new Date().toISOString().split("T")[0]

  // Calculate total labels
  const calculateTotalLabels = () => {
    return labelRolls.reduce((total, roll) => {
      if (roll.verified && roll.startNumber && roll.endNumber) {
        const startMatch = roll.startNumber.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = roll.endNumber.match(/^([A-Za-z]+)(\d+)$/);

        if (!startMatch || !endMatch) return total; // Skip invalid format

        const startPrefix = startMatch[1];
        const endPrefix = endMatch[1];

        if (startPrefix !== endPrefix) return total; // Ensure same prefix

        const start = parseInt(startMatch[2], 10);
        const end = parseInt(endMatch[2], 10);

        if (!isNaN(start) && !isNaN(end) && end >= start) {
          return total + (end - start + 1);
        }
      }
      return total;
    }, 0);
  };


  // Add new label roll
  const addLabelRoll = () => {
    const newRollNumber = (labelRolls.length + 1).toString();
    setLabelRolls([
      ...labelRolls,
      {
        id: newRollNumber,
        rollNumber: newRollNumber,
        startNumber: "",
        endNumber: "",
        verified: false,
      },
    ]);
  };

  // Update label roll
  const updateLabelRoll = (id: string, field: keyof LabelRoll, value: string | boolean) => {
    setLabelRolls(labelRolls.map((roll) => (roll.id === id ? { ...roll, [field]: value } : roll)));
  };

  // Verify label roll
  const verifyLabelRoll = (id: string) => {
    const roll = labelRolls.find((r) => r.id === id);
    if (roll && roll.rollNumber && roll.startNumber && roll.endNumber) {
      const startMatch = roll.startNumber.match(/^([A-Za-z]+)(\d+)$/);
      const endMatch = roll.endNumber.match(/^([A-Za-z]+)(\d+)$/);

      if (!startMatch || !endMatch) return; // Invalid format, skip

      const startPrefix = startMatch[1];
      const endPrefix = endMatch[1];

      if (startPrefix !== endPrefix) return; // Ensure prefix consistency

      const start = parseInt(startMatch[2], 10);
      const end = parseInt(endMatch[2], 10);

      if (!isNaN(start) && !isNaN(end) && end >= start) {
        updateLabelRoll(id, "verified", true);
      }
    }
  };


  // Load products when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && products.length === 0) {
      setLoading(true)
      try {
        window.sqlite.get_products().then((data: any) => {
          console.log(data)
          setProducts(data)
        })
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
    let metadata: any = [
      "SIRIM SERIAL NO.",
      "BATCH NO",
      "BRAND/TRADEMARK",
      "MODEL",
      "TYPE",
      "RATING",
      "SIZE"
    ];
    let data: any = []
    let title: any = 'Report'

    if (section === "captured") {
      data = capturedData
        .filter(item => !missingData.some(dup => dup.serial === item.serial) && !manualRejectEntries.some(dup => dup.serialNumber === item.serial)) // Exclude duplicates first
        .map((item: any) => [
          item.serial,
          batchNo,
          productData.brand,
          productData.model,
          productData.type,
          productData.rating,
          productData.size
        ]);

      title = "SIRIM REPORT"
    }

    if (section === "manual-reject") {
      data = manualRejectEntries.map((item: any) => [
        item.serialNumber,
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size
      ]);

      title = "MANUAL REJECT REPORT"
    }

    if (section === "missing") {
      data = missingData.map((item: any) => [
        item.serial,
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size
      ]);

      title = "MISSING REPORT"
    }

    if (section === "duplicate") {
      data = duplicatedData.map((item: any) => [
        item.serial,
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size
      ]);

      title = "DUPLICATE REPORT"
    }

    if (section === "unused-serials") {
      metadata = ["SIRIM SERIAL NO."];
      data = remainingSerials.map((item: any) => [
        item
      ])

      title = "UNUSED SERIALS REPORT"
    }

    try {
      window.excel.save_to_excel(
        metadata,
        data,
        title
      )
    } catch (error) {
      console.error("Failed to save to Excel:", error)
    }
  }

  useEffect(() => {
    if (productionStatus !== "RUNNING") return;

    const handleTcpData = (data: any) => {
      let [serial, url, status] = data.split(',').map((data: string) => data.trim());
      console.log("Received Data:", serial, url, status);

      if (!status) return; // Ignore invalid data
      if (productionStatus !== "RUNNING") return;

      // Handle missing serial case
      if (!serial || !url) {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData;

          const lastEntry = prevData[prevData.length - 1];
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/);
          if (!match) return prevData; // Invalid format, skip

          const prefix = match[1]; // Extract prefix
          const lastSerialNum = parseInt(match[2], 10); // Extract numeric part
          const numLength = match[2].length; // Preserve number format

          const newSerialNum = lastSerialNum + 1;
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`;

          url = lastEntry.url;
          const newEntry = { serial, url, status };

          setMissingData((prevMissing) => [...prevMissing, newEntry]);
          return [...prevData, newEntry];
        });
        return;
      }

      // Validate serial against label rolls
      const serialNum = parseInt(serial.replace(/\D/g, ""), 10);
      const isValidSerial = labelRolls.some(({ startNumber, endNumber }) => {
        const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/);
        if (!startMatch || !endMatch) return false;

        const startPrefix = startMatch[1];
        const endPrefix = endMatch[1];

        if (startPrefix !== endPrefix) return false; // Ensure prefix consistency

        const start = parseInt(startMatch[2], 10);
        const end = parseInt(endMatch[2], 10);

        return serial.startsWith(startPrefix) && serialNum >= start && serialNum <= end;
      });

      if (!isValidSerial) return;

      setCapturedData((prevData) => {
        // Check if serial is already captured
        const alreadyCaptured = prevData.some(entry => entry.serial === serial);

        // If serial is a duplicate, add to duplicatedData
        if (alreadyCaptured) {
          setDuplicatedData((prevDuplicates) => {
            if (!prevDuplicates.some(dup => dup.serial === serial)) {
              return [...prevDuplicates, { serial, url, status }];
            }
            return prevDuplicates;
          });
          return prevData; // Don't add again
        }

        // Exclude manual rejected entries
        if (manualRejectEntries.some(entry => entry.serialNumber === serial)) {
          return prevData;
        }

        return [...prevData, { serial, url, status }];
      });
    };

    // Attach event listener only once
    window.tcpConnection.tcp_received(handleTcpData);

    return () => {
      window.tcpConnection.tcp_received(null); // Cleanup to prevent multiple bindings
    };
  }, [productionStatus]); // Empty dependency array to run only once

  // Generate list of all possible serials
  const totalSerials = labelRolls.flatMap(({ startNumber, endNumber }) => {
    const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/);
    const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/);

    if (!startMatch || !endMatch) return []; // Skip if format is invalid

    const prefix = startMatch[1];
    const numLength = startMatch[2].length;
    const start = parseInt(startMatch[2], 10);
    const end = parseInt(endMatch[2], 10);

    return (isNaN(start) || isNaN(end) || start > end)
      ? [] // Ensure valid range
      : Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${String(start + i).padStart(numLength, "0")}`);
  });

  // Get only the valid used serials (excluding missing & duplicates)
  const usedSerials = capturedData.map(({ serial }) => serial);

  // Calculate remaining serials
  const remainingSerials = totalSerials.filter(serial => !usedSerials.includes(serial));

  console.log("Used Serials:", usedSerials);
  console.log("Remaining Serials:", remainingSerials);

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
                              <Select value={selectedProduct} onValueChange={(value) => {
                                setSelectedProduct(value)
                                setProductData(products.find((product: any) => product.id.toString() === value) || {})
                              }}>
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
                                      <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.sku} - {product.model}
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
                          <Button type="button" onClick={saveProduction} disabled={productionStatus === "RUNNING" || labelRolls.some((roll) => !roll.verified)}>
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
                      {capturedData.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.status === "OK" ? (
                            `${item.serial}, ${item.url}, ${item.status}`
                          ) : (
                            <span className="text-red-500">{`${item.serial}, ${item.url}, ${item.status}`}</span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Auto-Reject Data */}
                  <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">UNUSED SERIALS</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{remainingSerials.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("unused-serials")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {remainingSerials.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item}`}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Bottom Row */}
                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">MISSING DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{missingData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("missing")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {missingData.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item.serial}, ${item.url}, ${item.status}`}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">DUPLICATE DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{duplicatedData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("duplicate")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {duplicatedData.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item.serial}, ${item.url}, ${item.status}`}
                        </div>
                      ))}
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
                    <CardContent className="h-[200px] overflow-y-auto">
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

