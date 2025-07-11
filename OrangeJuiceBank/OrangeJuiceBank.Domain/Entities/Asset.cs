public enum AssetType
{
    Acao,
    Cdb,
    TesouroDireto
}

public class Asset
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public AssetType Type { get; set; }
    public decimal CurrentPrice { get; set; }
}
