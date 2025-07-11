public enum AccountType
{
    Corrente = 1,
    Investimento = 2
}

public class Account
{
    public Guid Id { get; set; }
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; }

    public ICollection<Transaction> Transactions { get; set; }
    public ICollection<Investment> Investments { get; set; }
}
