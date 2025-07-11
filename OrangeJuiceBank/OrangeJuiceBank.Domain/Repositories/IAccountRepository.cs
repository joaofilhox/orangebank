
namespace OrangeJuiceBank.Domain.Repositories
{
    public interface IAccountRepository
    {
        Task<Account> GetByIdAsync(Guid id);
        Task UpdateAsync(Account account);
    }
}
