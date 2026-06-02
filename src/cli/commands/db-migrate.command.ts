import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { createSpinner, success, error, info } from '../../common/utils/output.util';

const BOOTSTRAP_SQL = `
  CREATE SCHEMA IF NOT EXISTS releases;

  CREATE TABLE IF NOT EXISTS releases.schema_migrations (
    id          SERIAL       PRIMARY KEY,
    filename    VARCHAR(255) NOT NULL UNIQUE,
    applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );
`;

@Injectable()
export class DbMigrateCommand {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(): Promise<void> {
    await this.bootstrap();

    const sqlDir = resolve(__dirname, '../../../shared/sql');
    if (!existsSync(sqlDir)) {
      error(`SQL directory not found: ${sqlDir}`);
      process.exit(1);
    }

    const files = readdirSync(sqlDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      info('No SQL files found in shared/sql/');
      return;
    }

    const applied = await this.getApplied();
    let count = 0;

    for (const file of files) {
      if (applied.has(file)) {
        info(`  Skipped (already applied): ${file}`);
        continue;
      }

      const spinner = createSpinner(`  Applying ${file}...`).start();
      try {
        const sql = readFileSync(join(sqlDir, file), 'utf-8');
        await this.dataSource.query(sql);
        await this.dataSource.query(
          'INSERT INTO releases.schema_migrations (filename) VALUES ($1)',
          [file],
        );
        spinner.succeed(`  Applied: ${file}`);
        count++;
      } catch (err: unknown) {
        spinner.fail(`  Failed: ${file} — ${(err as Error).message}`);
        throw err;
      }
    }

    if (count === 0) {
      info('No pending migrations.');
    } else {
      success(`Applied ${count} migration(s).`);
    }
  }

  private async bootstrap(): Promise<void> {
    await this.dataSource.query(BOOTSTRAP_SQL);
  }

  private async getApplied(): Promise<Set<string>> {
    const rows: { filename: string }[] = await this.dataSource.query(
      'SELECT filename FROM releases.schema_migrations ORDER BY filename',
    );
    return new Set(rows.map((r) => r.filename));
  }
}
