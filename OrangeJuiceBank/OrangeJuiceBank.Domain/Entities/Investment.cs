public class Investment
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public Account Account { get; set; }

    public Guid AssetId { get; set; }
    public Asset Asset { get; set; }

    public decimal Quantity { get; set; }
    public decimal AveragePrice { get; set; } 
    public DateTime CreatedAt { get; set; }
}
