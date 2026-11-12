import { curriculum } from "../../content/curriculum";
import {
  emptyLedger,
  normalizeLedger,
  importLegacyProgress,
  mergeLedgers,
  type Ledger,
} from "../../packages/curriculum/evidence";
import { Store } from "./store";
function parseRaw(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    return { unreadableStoredProgress: data };
  }
}
export function serverProgress(store: Store, userId: string): Ledger {
  const row = store.db
    .prepare("SELECT data FROM progress WHERE user_id=?")
    .get(userId) as { data: string } | undefined;
  if (!row) return emptyLedger();
  const raw = parseRaw(row.data);
  return typeof raw === "object" &&
    raw !== null &&
    "version" in raw &&
    raw.version === 2
    ? normalizeLedger(raw, curriculum)
    : importLegacyProgress(raw, curriculum);
}
export function persistProgress(
  store: Store,
  userId: string,
  incoming: Ledger,
) {
  store.db.exec("BEGIN IMMEDIATE");
  try {
    const before = store.db
      .prepare("SELECT data FROM progress WHERE user_id=?")
      .get(userId) as { data: string } | undefined;
    const merged = mergeLedgers(serverProgress(store, userId), incoming);
    merged.updatedAt = new Date().toISOString();
    if (before)
      store.db
        .prepare(
          "INSERT OR IGNORE INTO progress_backups(user_id,data,backed_up_at) VALUES(?,?,?)",
        )
        .run(userId, before.data, Date.now());
    store.db
      .prepare("INSERT OR REPLACE INTO progress VALUES(?,?)")
      .run(userId, JSON.stringify(merged));
    store.db.exec("COMMIT");
    return merged;
  } catch (e) {
    store.db.exec("ROLLBACK");
    throw e;
  }
}
