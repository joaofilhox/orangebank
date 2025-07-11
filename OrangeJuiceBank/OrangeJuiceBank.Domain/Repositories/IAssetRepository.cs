using System;
using System.Threading.Tasks;

namespace OrangeJuiceBank.Domain.Repositories
{
    public interface IAssetRepository
    {
        Task<Asset> GetByIdAsync(Guid id);
    }
}
