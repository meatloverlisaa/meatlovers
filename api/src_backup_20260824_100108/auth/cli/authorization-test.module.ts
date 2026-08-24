/**
 * Authorization Test Module
 * Module for authorization testing CLI
 * Part C: Authentication Recovery Sprint Part 3
 */

import { Module } from '@nestjs/common';
import { AuthorizationTestService } from '../authorization-test.service';

@Module({
  providers: [AuthorizationTestService],
  exports: [AuthorizationTestService],
})
export class AuthorizationTestModule {}
