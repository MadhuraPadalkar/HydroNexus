// Cross-entity complaint operation: assignment creates/links a work order.
// Calls repositories only — never the store.
import type { Complaint } from "@water/types"
import type { WorkOrder } from "../domain"
import { complaintRepository } from "../repositories/complaintRepository"
import { workOrderRepository } from "../repositories/workOrderRepository"

export interface AssignResult {
  complaint: Complaint
  workOrder: WorkOrder
}

export function assignComplaint(
  complaintId: string,
  engineer: string,
  actor: string,
  opts?: { workOrderId?: string; notes?: string },
): AssignResult | undefined {
  const complaint = complaintRepository.assign(
    complaintId,
    engineer,
    actor,
    opts?.notes,
  )
  if (!complaint) return undefined

  let workOrder = opts?.workOrderId
    ? workOrderRepository.findById(opts.workOrderId)
    : undefined
  if (workOrder) {
    workOrder.complaintId = complaintId
    workOrderRepository.update(workOrder.id, { assignedTo: engineer })
    workOrder = (workOrderRepository.findById(workOrder.id) as WorkOrder)
  } else {
    workOrder = workOrderRepository.create({
      complaintId,
      title: `${complaint.type} — ${complaint.ward}`,
      ward: complaint.ward,
      assignedTo: engineer,
      priority: complaint.priority || "Medium",
      notes: opts?.notes || "",
    })
  }
  return { complaint, workOrder }
}
