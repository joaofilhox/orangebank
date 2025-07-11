using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Infrastructure.Data;

namespace OrangeJuiceBank.Infrastructure.Repositories
{
    public class InvestmentRepository : IInvestmentRepository
    {
        private readonly ApplicationDbContext _context;

        public InvestmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Investment investment)
        {
            await _context.Investments.AddAsync(investment);
            await _context.SaveChangesAsync();
        }
    }
}
