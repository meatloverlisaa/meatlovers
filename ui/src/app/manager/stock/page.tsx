import { StockControlModule } from "@/components/stock/StockControlModule";

export default function ManagerStockPage() {
  return <StockControlModule role="MANAGER" canManage={false} />;
}
