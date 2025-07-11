using Microsoft.EntityFrameworkCore;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Infrastructure.Data;

namespace OrangeJuiceBank.Infrastructure.Repositories
{
    public class AssetRepository : IAssetRepository
    {
        private readonly ApplicationDbContext _context;

        public AssetRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Asset> GetByIdAsync(Guid id)
        {
            return await _context.Assets.FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}
