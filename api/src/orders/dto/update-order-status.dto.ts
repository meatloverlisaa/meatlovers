import { IsIn } from 'class-validator';

const statuses = [
  'PENDING',
  'PREPARING',
  'READY',
  'SERVED',
  'PAID',
  'CANCELLED',
] as const;

export class UpdateOrderStatusDto {
  @IsIn(statuses)
  status!: (typeof statuses)[number];
}
