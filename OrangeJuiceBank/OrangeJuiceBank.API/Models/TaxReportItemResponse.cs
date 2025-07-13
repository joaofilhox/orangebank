namespace OrangeJuiceBank.API.Models
{
    public class TaxReportItemResponse
    {
        public string AssetName { get; set; }
        public AssetType AssetType { get; set; }
        public DateTime SaleDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal Profit { get; set; }
        public decimal TaxRetained { get; set; }
    }
}
