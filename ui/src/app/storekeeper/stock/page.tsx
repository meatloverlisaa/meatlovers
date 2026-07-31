'use client';

import { StockControlModule } from "@/components/stock/StockControlModule";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function StorekeeperStockPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER']);

  return <StockControlModule role="STOREKEEPER" canManage />;
}
