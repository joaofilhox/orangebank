namespace OrangeJuiceBank.Domain.Services
{
    public interface IInvestmentService
    {
        Task BuyAssetAsync(Guid userId, Guid accountId, Guid assetId, decimal quantity);
    }
}
