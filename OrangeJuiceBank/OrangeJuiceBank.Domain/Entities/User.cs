public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }

    public ICollection<Account> Accounts { get; set; }
}
