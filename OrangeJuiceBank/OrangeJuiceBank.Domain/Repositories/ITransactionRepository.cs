
namespace OrangeJuiceBank.Domain.Repositories
{
    public interface ITransactionRepository
    {
        Task AddAsync(Transaction transaction);
    }
}
