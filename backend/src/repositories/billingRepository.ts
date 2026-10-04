import type { Bill, UsageDataPoint } from "../../../packages/types/src/index"
import { db } from "./store"

export const billingRepository = {
  historyByConsumer(consumerNumber: string): Bill[] {
    return db.bills.filter((b) => b.consumerNumber === consumerNumber)
  },
  findBill(id: string): Bill | undefined {
    return db.bills.find((b) => b.id === id)
  },
  currentBill(consumerNumber: string): Bill | undefined {
    const bills = db.bills.filter((b) => b.consumerNumber === consumerNumber)
    return (
      bills.find((b) => b.status === "Overdue") ||
      bills.find((b) => b.status === "Unpaid") ||
      bills[0]
    )
  },
  markPaid(id: string): Bill | undefined {
    const bill = db.bills.find((b) => b.id === id)
    if (!bill) return undefined
    bill.status = "Paid"
    return bill
  },
  usageByConsumer(consumerNumber: string): UsageDataPoint[] {
    return db.usageByConsumer[consumerNumber] || []
  },
}
