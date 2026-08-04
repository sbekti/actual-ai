import UnknownCategoryStrategy from '../src/transaction/processing-strategy/unknown-category-strategy';
import TagService from '../src/transaction/tag-service';
import InMemoryActualApiService from './test-doubles/in-memory-actual-api-service';
import GivenActualData from './test-doubles/given/given-actual-data';

describe('UnknownCategoryStrategy', () => {
  it('leaves the transaction uncategorized and marks it for review', async () => {
    const actualApiService = new InMemoryActualApiService();
    const transaction = GivenActualData.createTransaction(
      'unknown-transaction',
      -123,
      'Unknown merchant',
      'Original notes',
    );
    actualApiService.setTransactions([transaction]);
    const strategy = new UnknownCategoryStrategy(
      actualApiService,
      new TagService('#actual-ai-miss', '#actual-ai'),
    );

    expect(strategy.isSatisfiedBy({ type: 'unknown' })).toBe(true);
    await strategy.process(transaction);

    const [updatedTransaction] = await actualApiService.getTransactions();
    expect(updatedTransaction.category).toBeUndefined();
    expect(updatedTransaction.notes).toBe('Original notes #actual-ai-miss');
  });
});
