/**
 * TJU 校园卡 connector — Phase 2 占位
 */
import type { CasSession } from "./cas";

export interface CardBalance {
  balance: number; // 余额（元）
  studentId: string;
}

export interface CardTransaction {
  id: string;
  amount: number; // 负数为消费，正数为充值
  merchant: string;
  time: Date;
  balance: number; // 交易后余额
}

export async function fetchCardBalance(_session: CasSession): Promise<CardBalance> {
  throw new Error("Phase 2 not implemented — see docs/CONNECTORS.md");
}

export async function fetchCardTransactions(
  _session: CasSession,
  _startDate?: Date,
  _endDate?: Date,
): Promise<CardTransaction[]> {
  throw new Error("Phase 2 not implemented — see docs/CONNECTORS.md");
}
