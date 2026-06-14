/**
 * TJU 电费查询 connector — Phase 2 占位
 */
import type { CasSession } from "./cas";

export interface ElectricityStatus {
  balance: number; // 剩余电费（元）
  roomId: string;
  dormitory: string;
}

export async function fetchElectricityBalance(_session: CasSession): Promise<ElectricityStatus> {
  throw new Error("Phase 2 not implemented — see docs/CONNECTORS.md");
}
