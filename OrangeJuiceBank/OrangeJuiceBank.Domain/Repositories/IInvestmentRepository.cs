
namespace OrangeJuiceBank.Domain.Repositories
{
    public interface IInvestmentRepository
    {
        Task AddAsync(Investment investment);
        Task RemoveAsync(Investment investment);
    }
}
