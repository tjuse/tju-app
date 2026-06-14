/**
 * 校园卡 connector — 未来功能占位。
 * tju 库不覆盖校园卡系统（独立于 EAMS），需另行接入。
 */

export interface CardBalance {
  balance: number; // 余额（元）
  studentId: string;
}

export interface CardTransaction {
  id: string;
  amount: number; // 负数为消费，正数为充值
  merchant: string;
  time: string; // ISO
  balance: number; // 交易后余额
}

export function fetchCardBalance(): Promise<CardBalance> {
  throw new Error("校园卡功能尚未实现（独立于 tju/EAMS，待接入）");
}

export function fetchCardTransactions(): Promise<CardTransaction[]> {
  throw new Error("校园卡功能尚未实现（独立于 tju/EAMS，待接入）");
}
