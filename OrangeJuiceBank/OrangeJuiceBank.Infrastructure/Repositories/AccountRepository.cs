using Microsoft.EntityFrameworkCore;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Infrastructure.Data;

namespace OrangeJuiceBank.Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly ApplicationDbContext _context;

        public AccountRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Account> GetByIdAsync(Guid id)
        {
            return await _context.Accounts
                .Include(a => a.Transactions)
                .Include(a => a.Investments)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }
        public async Task AddAsync(Account account)
        {
            await _context.Accounts.AddAsync(account);
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<Account>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Accounts
                .Include(a => a.Investments)
                    .ThenInclude(i => i.Asset)
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }
    }
}
