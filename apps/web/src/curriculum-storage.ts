import { curriculum } from "../../../content/curriculum";
import {
  emptyLedger,
  normalizeLedger,
  mergeLedgers,
  legacyProjection,
  validateEvidence,
  type Ledger,
  type Evidence,
} from "../../../packages/curriculum/evidence";
import { write } from "./storage";
import { readLegacyArtifacts } from "./legacy-evidence";
export const ledgerKey = "nexus-curriculum-progress";
function rawProgress(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { unparsed: raw };
    }
  } catch {
    return null;
  }
}
export function readCurriculumProgress(): Ledger {
  const ledger = normalizeLedger(
    rawProgress(ledgerKey),
    curriculum,
    rawProgress("nexus-progress"),
  );
  for (const a of readLegacyArtifacts()) {
    const kind = a.kind === "worksheet" ? "project" : "lab";
    const id =
      a.id === "worksheet"
        ? "project.legacy-worksheet"
        : a.id.startsWith("python-")
          ? "lab." + a.id
          : "lab." + a.id;
    const e: Evidence = {
      kind,
      id,
      version: 1,
      completedAt: a.completedAt,
      source: kind === "project" ? "legacy" : "lab-import",
      proof: a.data,
    };
    if (
      validateEvidence(e, curriculum) &&
      !ledger.evidence.some(
        (item) => item.kind === kind && item.id === id && item.version === 1,
      )
    )
      ledger.evidence.push(e);
  }
  return ledger;
}
export function migrateLearningData(): boolean {
  try {
    const backupKey = "nexus-curriculum-backup-v1";
    if (!localStorage.getItem(backupKey)) {
      const original: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k === ledgerKey ||
            k === "nexus-progress" ||
            k === "nexus-worksheet" ||
            k.startsWith("nexus-lab-") ||
            k.startsWith("nexus-python-"))
        ) {
          const raw = localStorage.getItem(k);
          if (raw !== null) original[k] = raw;
        }
      }
      if (!write(backupKey, { format: 1, original })) return false;
    }
    return write(ledgerKey, readCurriculumProgress());
  } catch {
    return false;
  }
}
export function saveEvidence(e: Evidence) {
  if (!validateEvidence(e, curriculum)) return false;
  if (!migrateLearningData()) return false;
  const state = readCurriculumProgress();
  return write(
    ledgerKey,
    mergeLedgers(state, {
      ...emptyLedger(),
      evidence: [e],
      lastLesson: e.kind === "lesson" ? e.id : state.lastLesson,
      updatedAt: new Date().toISOString(),
    }),
  );
}
export function mergeRemoteProgress(remote: Ledger) {
  if (!migrateLearningData()) return false;
  return write(
    ledgerKey,
    mergeLedgers(readCurriculumProgress(), normalizeLedger(remote, curriculum)),
  );
}
export function compatibleProgress() {
  return legacyProjection(readCurriculumProgress(), curriculum);
}
