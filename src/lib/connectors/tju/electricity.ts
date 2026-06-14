/**
 * 电费 connector — 未来功能占位。
 * tju 库不覆盖电费/缴费系统，需另行接入。
 */

export interface ElectricityStatus {
  balance: number; // 剩余电费（元）
  roomId: string;
  dormitory: string;
}

export function fetchElectricityBalance(): Promise<ElectricityStatus> {
  throw new Error("电费功能尚未实现（独立于 tju/EAMS，待接入）");
}
