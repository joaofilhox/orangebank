
namespace OrangeJuiceBank.Domain.Repositories
{
    public interface ITransactionRepository
    {
        Task AddAsync(Transaction transaction);
        Task<List<Transaction>> GetByAccountIdAsync(Guid accountId);

    }
}
