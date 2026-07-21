import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AuthorizationScannerService } from '../authorization-scanner.service';

// Import all controller modules (but not services that need database)
import { AuthController } from '../auth.controller';
import { AuthorizationScannerController } from '../authorization-scanner.controller';
import { AppController } from '../../app.controller';
import { ProductController } from '../../product/product.controller';
import { SupplierController } from '../../supplier/supplier.controller';
import { StockController, StockTransfersController, StockAdjustmentsController } from '../../stock/stock.controller';
import { OrdersController } from '../../orders/orders.controller';
import { PaymentsController } from '../../payments/payments.controller';
import { KitchenController } from '../../kitchen/kitchen.controller';
import { BarController } from '../../bar/bar.controller';
import { DeliveriesController, RidersController } from '../../deliveries/deliveries.controller';
import { FinanceController } from '../../finance/finance.controller';
import { CrmController } from '../../crm/crm.controller';
import { WebsiteController } from '../../website/website.controller';
import { ApprovalsController } from '../../approvals/approvals.controller';
import { AdminDashboardController } from '../../admin-dashboard/admin-dashboard.controller';
import { CmsController } from '../../cms/cms.controller';
import { AssetsController } from '../../assets/assets.controller';
import { PosController } from '../../pos/pos.controller';

/**
 * Scanner Module - Lightweight module for authorization scanning
 * Does not initialize database or other heavy dependencies
 */
@Module({
  imports: [DiscoveryModule],
  controllers: [
    AuthController,
    AuthorizationScannerController,
    AppController,
    ProductController,
    SupplierController,
    StockController,
    StockTransfersController,
    StockAdjustmentsController,
    OrdersController,
    PaymentsController,
    KitchenController,
    BarController,
    DeliveriesController,
    RidersController,
    FinanceController,
    CrmController,
    WebsiteController,
    ApprovalsController,
    AdminDashboardController,
    CmsController,
    AssetsController,
    PosController,
  ],
  providers: [AuthorizationScannerService],
})
export class ScannerModule {}
