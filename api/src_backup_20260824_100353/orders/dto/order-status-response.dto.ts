export type OrderStatusResponseDto = {
  id: number | bigint;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
};
