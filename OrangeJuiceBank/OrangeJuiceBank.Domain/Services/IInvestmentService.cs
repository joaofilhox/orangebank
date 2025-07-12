namespace OrangeJuiceBank.Domain.Services
{
    public interface IInvestmentService
    {
        Task BuyAssetAsync(Guid userId, Guid accountId, Guid assetId, decimal quantity);
        Task SellAssetAsync(Guid userId, Guid accountId, Guid assetId, decimal quantity);
    }
}
