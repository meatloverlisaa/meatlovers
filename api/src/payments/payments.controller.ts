import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreatePaymentDto,
  PaymentStatus,
  RefundPaymentDto,
  SettlementSummaryDto,
} from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CASHIER_ROLES, FINANCE_ROLES } from '../auth/constants/role-groups';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(...FINANCE_ROLES, ...CASHIER_ROLES)
  findAll(@Query() query: any) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  @Roles(...FINANCE_ROLES, ...CASHIER_ROLES)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(Number(id));
  }

  @Get('order/:orderId')
  @Roles(...FINANCE_ROLES, ...CASHIER_ROLES)
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(Number(orderId));
  }

  @Post('settle')
  @Roles(...CASHIER_ROLES)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Patch(':id/status')
  @Roles(...CASHIER_ROLES, ...FINANCE_ROLES)
  updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.paymentsService.updatePaymentStatus(id, status);
  }

  @Post(':id/refund')
  @Roles(...FINANCE_ROLES)
  refund(@Param('id') id: string, @Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(Number(id), refundPaymentDto);
  }

  @Get('settlement/summary')
  @Roles(...FINANCE_ROLES, ...CASHIER_ROLES)
  getSettlementSummary(@Query() query: SettlementSummaryDto) {
    return this.paymentsService.getSettlementSummary(query);
  }

  @Get(':id/receipt')
  @Roles(...CASHIER_ROLES, ...FINANCE_ROLES)
  generateReceipt(@Param('id') id: string) {
    return this.paymentsService.generateReceipt(Number(id));
  }

  @Get('reports/reconciliation')
  @Roles(...FINANCE_ROLES)
  reconciliation(@Query() query: any) {
    return this.paymentsService.reconciliation(query);
  }
}
