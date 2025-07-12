using System;

namespace OrangeJuiceBank.API.Models
{
    public class InvestmentPortfolioResponse
    {
        public Guid InvestmentId { get; set; }
        public Guid AccountId { get; set; }
        public string AssetName { get; set; }
        public string AssetType { get; set; }
        public decimal Quantity { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal CurrentPrice { get; set; }
    }
}
