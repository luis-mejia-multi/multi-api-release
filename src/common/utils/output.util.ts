import chalk from 'chalk';
import ora from 'ora';
import type { Ora } from 'ora';
import Table from 'cli-table3';

export function success(msg: string): void {
  console.log(chalk.green('✓'), msg);
}

export function error(msg: string): void {
  console.log(chalk.red('✗'), msg);
}

export function info(msg: string): void {
  console.log(chalk.blue('ℹ'), msg);
}

export function warn(msg: string): void {
  console.log(chalk.yellow('⚠'), msg);
}

export function createSpinner(text: string): Ora {
  return ora({ text, color: 'cyan' });
}

export function createTable(head: string[]): Table.Table {
  return new Table({
    head: head.map((h) => chalk.cyan(h)),
    style: { head: [] },
  });
}
