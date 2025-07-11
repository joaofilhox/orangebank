namespace OrangeJuiceBank.API.Models
{
    public class BalanceResponse
    {
        public Guid AccountId { get; set; }
        public decimal Balance { get; set; }
    }
}
