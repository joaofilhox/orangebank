﻿
namespace OrangeJuiceBank.Domain.Repositories
{
    public interface IAccountRepository
    {
        Task<Account> GetByIdAsync(Guid id);
        Task UpdateAsync(Account account);
        Task AddAsync(Account account);
        Task<IEnumerable<Account>> GetByUserIdAsync(Guid userId);
    }
}
