import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePaymentDto, PaymentStatus, RefundPaymentDto, SettlementSummaryDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(Number(id));
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(Number(orderId));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.updatePaymentStatus(id, status);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(Number(id), refundPaymentDto);
  }

  @Get('settlement/summary')
  getSettlementSummary(@Query() query: SettlementSummaryDto) {
    return this.paymentsService.getSettlementSummary(query);
  }

  @Get(':id/receipt')
  generateReceipt(@Param('id') id: string) {
    return this.paymentsService.generateReceipt(Number(id));
  }
}
