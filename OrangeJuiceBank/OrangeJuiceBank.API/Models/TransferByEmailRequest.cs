namespace OrangeJuiceBank.API.Models
{
    public class TransferByEmailRequest
    {
        public Guid SourceAccountId { get; set; }
        public string DestinationEmail { get; set; }
        public decimal Amount { get; set; }
    }
} 