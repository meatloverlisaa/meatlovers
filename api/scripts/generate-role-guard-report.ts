import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createE2EApp } from '../test/utils/create-e2e-app';
import { scanAuthorizationCoverage } from '../test/utils/route-authorization-scanner';

async function main(): Promise<void> {
  const app = await createE2EApp();

  try {
    const rows = scanAuthorizationCoverage(app);
    const uncovered = rows.filter((row) => !row.covered);
    const publicRoutes = rows.filter((row) => row.isPublic);
    const protectedRoutes = rows.filter(
      (row) => !row.isPublic && row.roles.length > 0,
    );

    const coveragePercentage =
      rows.length === 0
        ? 0
        : Number(
            (
              ((rows.length - uncovered.length) / rows.length) *
              100
            ).toFixed(2),
          );

    const tableRows = rows
      .map(
        (row) =>
          `| ${row.controller} | ${row.handler} | ` +
          `${row.controllerPath}/${row.handlerPath} | ` +
          `${row.isPublic ? 'PUBLIC' : row.roles.join(', ')} | ` +
          `${row.covered ? 'PASS' : 'FAIL'} |`,
      )
      .join('\n');

    const report = `# Role Guard Coverage Report

## Summary

| Metric | Result |
|---|---:|
| Total registered endpoints | ${rows.length} |
| Public endpoints | ${publicRoutes.length} |
| Protected endpoints | ${protectedRoutes.length} |
| Missing authorization policy | ${uncovered.length} |
| Authorization coverage | ${coveragePercentage}% |

## Certification Decision

\`\`\`text
ROLE GUARD COVERAGE: ${uncovered.length === 0 ? 'PASS' : 'FAIL'}
\`\`\`

## Endpoint Matrix

| Controller | Handler | Path | Policy | Result |
|---|---|---|---|---|
${tableRows}

## Uncovered Endpoints

${
  uncovered.length === 0
    ? 'None.'
    : uncovered
        .map(
          (row) =>
            `- ${row.controller}.${row.handler} ` +
            `(${row.controllerPath}/${row.handlerPath})`,
        )
        .join('\n')
}
`;

    const outputPath = join(
      process.cwd(),
      'docs',
      'ROLE_GUARD_COVERAGE_REPORT.md',
    );

    await writeFile(outputPath, report, 'utf8');

    console.log(`Report written to ${outputPath}`);

    if (uncovered.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

void main();
