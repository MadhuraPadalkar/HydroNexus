// Pre-permission explanations + friendly denial handling (Task 2, item 4).
//
// Every native permission is preceded by a short message telling the user
// why the app needs it. If the user declines, we show a friendly note and
// the app keeps working (no blocking, no crash).

export type PermissionKind = "camera" | "location" | "notifications";

export const PERMISSION_REASONS: Record<PermissionKind, string> = {
  camera:
    "We need camera / photo access so you can attach a photo of the issue (e.g. a leaking pipe) to your complaint.",
  location:
    "We need your location so we can tag exactly where the leak or issue is.",
  notifications:
    "We need notification permission so we can send you complaint-status and water-supply alerts.",
};

const DENIED_MESSAGES: Record<PermissionKind, string> = {
  camera:
    "No problem — you can still file your complaint without a photo. You can try again any time.",
  location:
    "No problem — you can still file your complaint without tagging your location. You can try again any time.",
  notifications:
    "No problem — you can still use the app normally; you just won't get complaint and supply alerts. You can enable notifications later in system settings.",
};

/** Show the "why we need it" message. Returns true when the user agrees to continue. */
export function explainWhy(kind: PermissionKind): boolean {
  return window.confirm(`${PERMISSION_REASONS[kind]}\n\nContinue?`);
}

/** Show a friendly message when the user denies a permission. App keeps working. */
export function explainDenial(kind: PermissionKind): void {
  window.alert(DENIED_MESSAGES[kind]);
}
