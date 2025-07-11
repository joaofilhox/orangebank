namespace OrangeJuiceBank.API.Models
{
    public class TransactionResponse
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
