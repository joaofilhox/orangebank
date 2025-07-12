using OrangeJuiceBank.Domain;

namespace OrangeJuiceBank.API.Models
{
    public class AssetResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public AssetType Type { get; set; }
        public decimal CurrentPrice { get; set; }
    }
}
