import { INestApplication } from '@nestjs/common';
import { createE2EApp } from './utils/create-e2e-app';
import {
  AuthorizationCoverageRow,
  scanAuthorizationCoverage,
} from './utils/route-authorization-scanner';

describe('Authorization metadata coverage', () => {
  let app: INestApplication;
  let rows: AuthorizationCoverageRow[];

  beforeAll(async () => {
    app = await createE2EApp();
    rows = scanAuthorizationCoverage(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('discovers registered routes', () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it('requires every endpoint to declare @Roles() or @Public()', () => {
    const uncovered = rows.filter((row) => !row.covered);

    if (uncovered.length > 0) {
      console.error(
        'Endpoints missing authorization metadata:',
        uncovered.map((row) => ({
          controller: row.controller,
          handler: row.handler,
          controllerPath: row.controllerPath,
          handlerPath: row.handlerPath,
        })),
      );
    }

    expect(uncovered).toEqual([]);
  });

  it('does not expose suspicious operational endpoints publicly', () => {
    const prohibitedPublicPrefixes = [
      'admin',
      'manager',
      'finance',
      'payments',
      'orders',
      'stock',
      'suppliers',
      'products',
      'approvals',
      'assets',
      'enforcement',
      'monitoring',
      'kitchen',
      'bar',
      'deliveries',
      'production-plans',
      'hrm',
      'procurement',
    ];

    const violations = rows.filter((row) => {
      const fullPath =
        `${row.controllerPath}/${row.handlerPath}`.toLowerCase();
      return (
        row.isPublic &&
        prohibitedPublicPrefixes.some((prefix) =>
          fullPath.includes(prefix),
        )
      );
    });

    expect(violations).toEqual([]);
  });
});
