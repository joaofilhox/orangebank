public enum TransactionType
{
    Deposito,
    Saque,
    TransferenciaInterna,
    TransferenciaExterna,
    CompraAtivo,
    VendaAtivo
}

public class Transaction
{
    public Guid Id { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public DateTime Timestamp { get; set; }

    public Guid SourceAccountId { get; set; }
    public Account SourceAccount { get; set; }

    public Guid? DestinationAccountId { get; set; }
    public Account DestinationAccount { get; set; }
}
