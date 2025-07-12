using OrangeJuiceBank.Domain;

namespace OrangeJuiceBank.API.Models
{
    public class AccountSummaryResponse
    {
        public Guid Id { get; set; }
        public AccountType Type { get; set; }
        public decimal Balance { get; set; }
    }
}
