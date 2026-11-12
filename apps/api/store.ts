import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
export type Limits = {
  requestsPerMinute: number;
  dailyTokens: number;
  userMonthlyMicroUsd: number;
  globalMonthlyMicroUsd: number;
  concurrency: number;
};
export const defaultLimits: Limits = {
  requestsPerMinute: 5,
  dailyTokens: 20000,
  userMonthlyMicroUsd: 1000000,
  globalMonthlyMicroUsd: 5000000,
  concurrency: 2,
};
export class Store {
  readonly db: DatabaseSync;
  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS progress(user_id TEXT PRIMARY KEY REFERENCES users(id), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS progress_backups(user_id TEXT PRIMARY KEY REFERENCES users(id),data TEXT NOT NULL,backed_up_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rate(key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS usage(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),created INTEGER NOT NULL, tokens INTEGER NOT NULL,micro_usd INTEGER NOT NULL,state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS flags(name TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS usage_time ON usage(created);
`);
  }
  rate(key: string, max: number, windowMs: number, now = Date.now()) {
    const bucket = key + ":" + Math.floor(now / windowMs);
    this.db.prepare("DELETE FROM rate WHERE expires < ?").run(now);
    const row = this.db
      .prepare(
        "INSERT INTO rate(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
      )
      .get(bucket, now + windowMs) as { count: number };
    return row.count <= max;
  }
  usage(userId: string, now = Date.now()) {
    const day = new Date(now).setUTCHours(0, 0, 0, 0);
    const date = new Date(now);
    const month = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    const tokens = (
      this.db
        .prepare(
          "SELECT COALESCE(SUM(tokens),0) AS n FROM usage WHERE user_id=? AND created>=?",
        )
        .get(userId, day) as { n: number }
    ).n;
    const userMicroUsd = (
      this.db
        .prepare(
          "SELECT COALESCE(SUM(micro_usd),0) AS n FROM usage WHERE user_id=? AND created>=?",
        )
        .get(userId, month) as { n: number }
    ).n;
    const globalMicroUsd = (
      this.db
        .prepare(
          "SELECT COALESCE(SUM(micro_usd),0) AS n FROM usage WHERE created>=?",
        )
        .get(month) as { n: number }
    ).n;
    return {
      dailyTokens: tokens,
      userMonthlyMicroUsd: userMicroUsd,
      globalMonthlyMicroUsd: globalMicroUsd,
    };
  }
  reserve(
    userId: string,
    tokens: number,
    microUsd: number,
    limits: Limits,
    now = Date.now(),
  ): { id?: string; reason?: string } {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      let reason: string | undefined;
      const u = this.usage(userId, now);
      const active = (
        this.db
          .prepare(
            "SELECT COUNT(*) AS n FROM usage WHERE state='reserved' AND created>?",
          )
          .get(now - 60000) as { n: number }
      ).n;
      if (
        this.db
          .prepare("SELECT value FROM flags WHERE name='provider-disabled'")
          .get()
      )
        reason = "provider-metering-unavailable";
      else if (u.dailyTokens + tokens > limits.dailyTokens)
        reason = "daily-token-limit";
      else if (u.userMonthlyMicroUsd + microUsd > limits.userMonthlyMicroUsd)
        reason = "account-budget-limit";
      else if (
        u.globalMonthlyMicroUsd + microUsd >
        limits.globalMonthlyMicroUsd
      )
        reason = "platform-budget-limit";
      else if (active >= limits.concurrency) reason = "concurrency-limit";
      else if (
        !this.rate("mentor:" + userId, limits.requestsPerMinute, 60000, now)
      )
        reason = "rate-limit";
      if (reason) {
        this.db.exec("COMMIT");
        return { reason };
      }
      const id = randomUUID();
      this.db
        .prepare("INSERT INTO usage VALUES(?,?,?,?,?,'reserved')")
        .run(id, userId, now, tokens, microUsd);
      this.db.exec("COMMIT");
      return { id };
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  reconcile(id: string, tokens?: number, microUsd?: number) {
    const row = this.db
      .prepare("SELECT tokens,micro_usd FROM usage WHERE id=?")
      .get(id) as { tokens: number; micro_usd: number } | undefined;
    if (!row) throw Error("Missing reservation");
    if (
      tokens === undefined ||
      microUsd === undefined ||
      tokens > row.tokens ||
      microUsd > row.micro_usd
    ) {
      this.db
        .prepare(
          "INSERT OR REPLACE INTO flags VALUES('provider-disabled','metering mismatch')",
        )
        .run();
      this.db
        .prepare(
          "UPDATE usage SET tokens=?,micro_usd=?,state='charged-conservatively' WHERE id=?",
        )
        .run(
          Math.max(row.tokens, tokens ?? 0),
          Math.max(row.micro_usd, microUsd ?? 0),
          id,
        );
      return;
    }
    this.db
      .prepare(
        "UPDATE usage SET tokens=?,micro_usd=?,state='settled' WHERE id=?",
      )
      .run(tokens, microUsd, id);
  }
  close() {
    this.db.close();
  }
}
