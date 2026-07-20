import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePaymentDto, PaymentStatus, RefundPaymentDto, SettlementSummaryDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { Public } from '../auth/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Public()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(Number(id));
  }

  @Get('order/:orderId')
  @Public()
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(Number(orderId));
  }

  @Patch(':id/status')
  @Public()
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.updatePaymentStatus(id, status);
  }

  @Post(':id/refund')
  @Public()
  refund(@Param('id') id: string, @Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(Number(id), refundPaymentDto);
  }

  @Get('settlement/summary')
  @Public()
  getSettlementSummary(@Query() query: SettlementSummaryDto) {
    return this.paymentsService.getSettlementSummary(query);
  }

  @Get(':id/receipt')
  @Public()
  generateReceipt(@Param('id') id: string) {
    return this.paymentsService.generateReceipt(Number(id));
  }
}
