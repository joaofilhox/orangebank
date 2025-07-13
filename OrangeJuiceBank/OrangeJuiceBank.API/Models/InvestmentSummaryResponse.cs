
namespace OrangeJuiceBank.API.Models
{
    public class InvestmentSummaryResponse
    {
        public string AssetName { get; set; } = string.Empty;
        public AssetType AssetType { get; set; }
        public decimal Quantity { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal TotalInvested { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal Profit { get; set; }
    }
}
