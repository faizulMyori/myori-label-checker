"use client"

import { useContext, useState, useEffect } from "react"
import { UserContext } from "@/App"
import Footer from "@/components/template/Footer"
import ProductionControls from "./components/production-controls"
import ProductionData from "./components/production-data"
import CapturedData from "./components/captured-data"
import UnusedSerials from "./components/unused-serials"
import MissingData from "./components/missing-data"
import DuplicatedData from "./components/duplicated-data"
import ManualRejectData from "./components/manual-reject-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductionState } from "./hooks/use-production-state"
import { useLabelRolls } from "./hooks/use-label-rolls"
import { useProductionSetup } from "./hooks/use-production-setup"
import { useReportDownload } from "./hooks/use-report-download"
import { ProductionProvider } from "./context/production-context"
import { Toaster } from "sonner"
import React from "react"

export default function ProductionPage() {
  const { prodStatus, setProdStatus, conn }: any = useContext(UserContext)

  // Initialize all the hooks and state
  const { productionStatus, setProductionStatus, startProduction, holdProduction, resumeProduction, stopProduction } =
    useProductionState(setProdStatus, conn)

  const { labelRolls, addLabelRoll, updateLabelRoll, verifyLabelRoll, calculateTotalLabels } = useLabelRolls()

  const [capturedData, setCapturedData] = useState<any[]>([])
  const [duplicatedData, setDuplicatedData] = useState<any[]>([])
  const [missingData, setMissingData] = useState<any[]>([])
  const [unusedSerials, setUnusedSerials] = useState<string[]>([])

  const {
    open,
    setOpen,
    batchID,
    setBatchID,
    batchNo,
    setBatchNo,
    shiftNo,
    setShiftNo,
    batches,
    batchError,
    setBatchError,
    selectedProduct,
    setSelectedProduct,
    products,
    loading,
    savedProduction,
    setSavedProduction,
    productData,
    setProductData,
    handleOpenChange,
    saveProduction,
  } = useProductionSetup(labelRolls, calculateTotalLabels)

  const {
    manualRejectEntries,
    setManualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    setNewSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
  } = useManualReject()

  const { handleDownload } = useReportDownload(
    capturedData,
    missingData,
    duplicatedData,
    manualRejectEntries,
    batchNo,
    productData,
    unusedSerials,
  )

  // Generate all possible serials from label rolls
  const generateAllSerials = () => {
    return labelRolls.flatMap(({ startNumber, endNumber }) => {
      if (!startNumber || !endNumber) return []

      const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
      const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)

      if (!startMatch || !endMatch) return [] // Skip if format is invalid

      const prefix = startMatch[1]
      const numLength = startMatch[2].length
      const start = Number.parseInt(startMatch[2], 10)
      const end = Number.parseInt(endMatch[2], 10)

      return isNaN(start) || isNaN(end) || start > end
        ? [] // Ensure valid range
        : Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${String(start + i).padStart(numLength, "0")}`)
    })
  }

  // Initialize unused serials when label rolls change
  useEffect(() => {
    if (labelRolls.some((roll) => roll.verified)) {
      const allSerials = generateAllSerials()
      setUnusedSerials(allSerials)
      console.log("Initialized unused serials:", allSerials.length)
    }
  }, [labelRolls])

  // Handle removing a serial from unused serials
  const removeFromUnusedSerials = (serial: string) => {
    if (!serial) return
    setUnusedSerials((prev) => {
      const newUnused = prev.filter((s) => s !== serial)
      console.log(`Removed ${serial} from unused serials. Remaining: ${newUnused.length}`)
      return newUnused
    })
  }

  // Handle adding a serial back to unused serials
  const addToUnusedSerials = (serial: string) => {
    if (!serial) return

    // Check if the serial is in captured data
    const isInCapturedData = capturedData.some((item) => item.serial === serial)

    if (isInCapturedData) {
      console.log(`Serial ${serial} is in captured data, not adding to unused serials`)
      return
    }

    // Only add if it's not already in the list
    setUnusedSerials((prev) => {
      if (!prev.includes(serial)) {
        const newUnused = [...prev, serial]
        console.log(`Added ${serial} back to unused serials. Total: ${newUnused.length}`)
        return newUnused
      }
      return prev
    })
  }

  // Handle TCP data capture
  useEffect(() => {
    if (productionStatus !== "RUNNING") {
      return () => {
        window.tcpConnection.tcp_received(undefined) // Properly remove listener
      }
    }

    const handleTcpData = (data: any) => {
      let [serial, url, status] = data.split(",").map((data: string) => data.trim())
      console.log("Received Data:", data)

      if (!status) return // Ignore invalid data
      if (productionStatus !== "RUNNING") return

      setCapturedData((prevData) => {
        if (prevData.length > 0) {
          const lastEntry = prevData[prevData.length - 1]
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/)

          if (match) {
            const prefix = match[1]
            const lastSerialNum = Number.parseInt(match[2], 10)
            const numLength = match[2].length

            const currentMatch = serial.match(/^([A-Za-z]+)(\d+)$/)
            if (currentMatch) {
              const currentSerialNum = Number.parseInt(currentMatch[2], 10)
              if (currentSerialNum > lastSerialNum + 1) {
                for (let i = lastSerialNum + 1; i < currentSerialNum; i++) {
                  const skippedSerial = `${prefix}${String(i).padStart(numLength, "0")}`
                  setMissingData((prevMissing) => {
                    // Add to missing data
                    const newMissing = [
                      ...prevMissing,
                      { serial: skippedSerial, url: lastEntry.url, status: "MISSING" },
                    ]
                    // Remove from unused serials
                    removeFromUnusedSerials(skippedSerial)
                    return newMissing
                  })
                }
              }
            }
          }
        }
        return prevData
      })

      if (!serial || !url) {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData

          const lastEntry = prevData[prevData.length - 1]
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/)
          if (!match) return prevData

          const prefix = match[1]
          const lastSerialNum = Number.parseInt(match[2], 10)
          const numLength = match[2].length

          const newSerialNum = lastSerialNum + 1
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`

          url = lastEntry.url
          const newEntry = { serial, url, status }

          setMissingData((prevMissing) => {
            // Add to missing data
            const newMissing = [...prevMissing, newEntry]
            // Remove from unused serials
            removeFromUnusedSerials(serial)
            return newMissing
          })
          return [...prevData, newEntry]
        })
        return
      }

      if (serial && url && status === "NG") {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData

          const lastEntry = prevData[prevData.length - 1]
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/)
          if (!match) return prevData

          const prefix = match[1]
          const lastSerialNum = Number.parseInt(match[2], 10)
          const numLength = match[2].length

          const newSerialNum = lastSerialNum + 1
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`

          url = lastEntry.url
          const newEntry = { serial, url, status }

          setMissingData((prevMissing) => {
            // Add to missing data
            const newMissing = [...prevMissing, newEntry]
            // Remove from unused serials
            removeFromUnusedSerials(serial)
            return newMissing
          })
          return [...prevData, newEntry]
        })
        return
      }

      const serialNum = Number.parseInt(serial.replace(/\D/g, ""), 10)
      const isValidSerial = labelRolls.some(({ startNumber, endNumber }) => {
        if (!startNumber || !endNumber) return false

        const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
        const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)
        if (!startMatch || !endMatch) return false

        const startPrefix = startMatch[1]
        const endPrefix = endMatch[1]
        if (startPrefix !== endPrefix) return false

        const start = Number.parseInt(startMatch[2], 10)
        const end = Number.parseInt(endMatch[2], 10)

        return serial.startsWith(startPrefix) && serialNum >= start && serialNum <= end
      })

      if (!isValidSerial) return

      setCapturedData((prevData) => {
        const alreadyCaptured = prevData.some((entry) => entry.serial === serial)

        if (alreadyCaptured) {
          setDuplicatedData((prevDuplicates) => {
            if (!prevDuplicates.some((dup) => dup.serial === serial)) {
              // Add to duplicated data
              const newDuplicates = [...prevDuplicates, { serial, url, status }]
              // Remove from unused serials
              removeFromUnusedSerials(serial)
              return newDuplicates
            }
            return prevDuplicates
          })

          window.serial.serial_com_send("@0101\r")
          return prevData
        }

        if (manualRejectEntries.some((entry) => entry.serialNumber === serial)) {
          return prevData
        }

        // Remove from unused serials when captured
        removeFromUnusedSerials(serial)
        return [...prevData, { serial, url, status }]
      })
    }

    window.tcpConnection.tcp_received(handleTcpData)

    return () => {
      window.tcpConnection.tcp_received(undefined) // Properly remove listener
    }
  }, [productionStatus, labelRolls, manualRejectEntries])

  // Handle removing a missing data entry
  const handleRemoveMissingEntry = (serial: string) => {
    setMissingData((prevData) => {
      console.log(`Removing ${serial} from missing data`)
      return prevData.filter((item) => item.serial !== serial)
    })

    // Check if the serial is in captured data before adding back to unused serials
    const isInCapturedData = capturedData.some((item) => item.serial === serial)

    if (isInCapturedData) {
      console.log(`Serial ${serial} is in captured data, not adding to unused serials`)
      return
    }

    // Add back to unused serials only if not in captured data
    addToUnusedSerials(serial)
  }

  // Handle removing a duplicated data entry
  const handleRemoveDuplicatedEntry = (serial: string) => {
    setDuplicatedData((prevData) => {
      console.log(`Removing ${serial} from duplicated data`)
      return prevData.filter((item) => item.serial !== serial)
    })

    // Check if the serial is in captured data before adding back to unused serials
    const isInCapturedData = capturedData.some((item) => item.serial === serial)

    if (isInCapturedData) {
      console.log(`Serial ${serial} is in captured data, not adding to unused serials`)
      return
    }

    // Add back to unused serials only if not in captured data
    addToUnusedSerials(serial)
  }

  // Combine all context values
  const contextValue = {
    productionStatus,
    setProductionStatus,
    startProduction,
    holdProduction,
    resumeProduction,
    stopProduction,
    labelRolls,
    addLabelRoll,
    updateLabelRoll,
    verifyLabelRoll,
    calculateTotalLabels,
    capturedData,
    setCapturedData,
    duplicatedData,
    missingData,
    open,
    setOpen,
    batchID,
    batchNo,
    setBatchNo,
    shiftNo,
    setShiftNo,
    batches,
    batchError,
    setBatchError,
    selectedProduct,
    setSelectedProduct,
    products,
    loading,
    savedProduction,
    productData,
    handleOpenChange,
    saveProduction,
    manualRejectEntries,
    setManualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
    handleDownload,
    unusedSerials,
    handleRemoveMissingEntry,
    handleRemoveDuplicatedEntry,
  }

  return (
    <ProductionProvider value={contextValue}>
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
                  <ProductionControls />

                  {/* Production Data Display */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Production Data */}
                    <ProductionData />

                    {/* Reading Captured Data */}
                    <CapturedData />

                    {/* Auto-Reject Data */}
                    <UnusedSerials />

                    {/* Bottom Row */}
                    <MissingData />
                    <DuplicatedData />
                    <ManualRejectData />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </ProductionProvider>
  )
}

function useManualReject() {
  const [manualRejectEntries, setManualRejectEntries] = useState<{ id: string; serialNumber: string }[]>([])
  const [isManualRejectModalOpen, setIsManualRejectModalOpen] = useState(false)
  const [newSerialNumbers, setNewSerialNumbers] = useState([""]) // Start with an empty field

  const handleSerialNumberChange = (index: number, value: string) => {
    const updatedSerialNumbers = [...newSerialNumbers]
    updatedSerialNumbers[index] = value
    setNewSerialNumbers(updatedSerialNumbers)
  }

  const handleAddSerialNumberField = () => {
    setNewSerialNumbers((prev) => [...prev, ""])
  }

  const handleRemoveSerialNumberField = (index: number) => {
    const updatedSerialNumbers = newSerialNumbers.filter((_, i) => i !== index)
    setNewSerialNumbers(updatedSerialNumbers)
  }

  const addManualRejectEntries = () => {
    const validEntries = newSerialNumbers.filter((serialNumber) => serialNumber.trim() !== "")

    if (validEntries.length > 0) {
      setManualRejectEntries((prevEntries) => [
        ...prevEntries,
        ...validEntries.map((serialNumber) => ({
          id: Date.now() + Math.random().toString(), // Use a unique ID for each entry
          serialNumber,
        })),
      ])
      setNewSerialNumbers([""]) // Reset the serial number fields
      setIsManualRejectModalOpen(false)
    }
  }

  const handleDeleteEntry = (id: string) => {
    setManualRejectEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id))
  }

  return {
    manualRejectEntries,
    setManualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    setNewSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
  }
}

