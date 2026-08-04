import {
  ActualAiServiceI, ActualApiServiceI, NotesMigratorI, TransactionServiceI,
} from './types';
import suppressConsoleLogsAsync from './utils';
import { isFeatureEnabled } from './config';

class ActualAiService implements ActualAiServiceI {
  private readonly transactionService: TransactionServiceI;

  private readonly actualApiService: ActualApiServiceI;

  private readonly notesMigrator: NotesMigratorI;

  constructor(
    transactionService: TransactionServiceI,
    actualApiService: ActualApiServiceI,
    notesMigrator: NotesMigratorI,
  ) {
    this.transactionService = transactionService;
    this.actualApiService = actualApiService;
    this.notesMigrator = notesMigrator;
  }

  public async classify() {
    console.log('Starting classification process');
    let isBudgetOpen = false;
    try {
      await this.actualApiService.initializeApi();
      isBudgetOpen = true;

      if (isFeatureEnabled('syncAccountsBeforeClassify')) {
        await this.syncAccounts();
      }

      await this.notesMigrator.migrateToTags();
      await this.transactionService.processTransactions();
    } finally {
      if (isBudgetOpen) {
        await this.actualApiService.shutdownApi();
      }
    }
  }

  async syncAccounts(): Promise<void> {
    console.log('Syncing bank accounts');
    await suppressConsoleLogsAsync(async () => this.actualApiService.runBankSync());
    console.log('Bank accounts synced');
  }
}

export default ActualAiService;
