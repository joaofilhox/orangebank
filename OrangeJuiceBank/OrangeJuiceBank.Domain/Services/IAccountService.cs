
namespace OrangeJuiceBank.Domain.Services
{
    public interface IAccountService
    {
        Task DepositAsync(Guid accountId, decimal amount);
        Task WithdrawAsync(Guid accountId, decimal amount);
        Task TransferAsync(Guid sourceAccountId, Guid destinationAccountId, decimal amount);
    }
}
