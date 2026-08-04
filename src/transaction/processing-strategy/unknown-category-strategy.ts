import type { TransactionEntity } from '@actual-app/core/src/types/models';
import type { ActualApiServiceI, ProcessingStrategyI, UnifiedResponse } from '../../types';
import TagService from '../tag-service';

class UnknownCategoryStrategy implements ProcessingStrategyI {
  private readonly actualApiService: ActualApiServiceI;

  private readonly tagService: TagService;

  constructor(actualApiService: ActualApiServiceI, tagService: TagService) {
    this.actualApiService = actualApiService;
    this.tagService = tagService;
  }

  isSatisfiedBy(response: UnifiedResponse): boolean {
    return response.type === 'unknown';
  }

  async process(transaction: TransactionEntity): Promise<void> {
    await this.actualApiService.updateTransactionNotes(
      transaction.id,
      this.tagService.addNotGuessedTag(transaction.notes ?? ''),
    );
  }
}

export default UnknownCategoryStrategy;
