using OrangeJuiceBank.Domain;

namespace OrangeJuiceBank.API.Models
{
    public class UpdateAssetRequest
    {
        public string Name { get; set; }
        public AssetType Type { get; set; }
        public decimal CurrentPrice { get; set; }
    }
} 