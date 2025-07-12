using System;
using System.Threading.Tasks;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;
using OrangeJuiceBank.Domain;

namespace OrangeJuiceBank.Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;

        public AccountService(
            IAccountRepository accountRepository,
            ITransactionRepository transactionRepository)
        {
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task DepositAsync(Guid accountId, decimal amount)
        {
            if (amount <= 0)
                throw new InvalidOperationException("O valor do depósito deve ser positivo.");

            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
                throw new InvalidOperationException("Conta não encontrada.");

            account.Balance += amount;

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.Deposito,
                Amount = amount,
                Timestamp = DateTime.UtcNow,
                SourceAccountId = accountId
            };

            await _transactionRepository.AddAsync(transaction);
            await _accountRepository.UpdateAsync(account);
        }

        public async Task WithdrawAsync(Guid accountId, decimal amount)
        {
            if (amount <= 0)
                throw new InvalidOperationException("O valor do saque deve ser positivo.");

            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
                throw new InvalidOperationException("Conta não encontrada.");

            if (account.Balance < amount)
                throw new InvalidOperationException("Saldo insuficiente.");

            account.Balance -= amount;

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.Saque,
                Amount = amount,
                Timestamp = DateTime.UtcNow,
                SourceAccountId = accountId
            };

            await _transactionRepository.AddAsync(transaction);
            await _accountRepository.UpdateAsync(account);
        }

        public async Task TransferAsync(Guid sourceAccountId, Guid destinationAccountId, decimal amount)
        {
            if (amount <= 0)
                throw new InvalidOperationException("O valor da transferência deve ser positivo.");

            if (sourceAccountId == destinationAccountId)
                throw new InvalidOperationException("A conta de origem e destino não podem ser iguais.");

            var source = await _accountRepository.GetByIdAsync(sourceAccountId);
            var destination = await _accountRepository.GetByIdAsync(destinationAccountId);

            if (source == null || destination == null)
                throw new InvalidOperationException("Conta de origem ou destino não encontrada.");

            if (source.Balance < amount)
                throw new InvalidOperationException("Saldo insuficiente na conta de origem.");

            source.Balance -= amount;
            destination.Balance += amount;

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.TransferenciaInterna,
                Amount = amount,
                Timestamp = DateTime.UtcNow,
                SourceAccountId = sourceAccountId,
                DestinationAccountId = destinationAccountId
            };

            await _transactionRepository.AddAsync(transaction);
            await _accountRepository.UpdateAsync(source);
            await _accountRepository.UpdateAsync(destination);
        }

        public async Task<Account?> GetAccountByIdAsync(Guid accountId)
        {
            var account = await _accountRepository.GetByIdAsync(accountId);
            return account;
        }
        public async Task CreateAccountAsync(Account account)
        {
            if (account == null)
                throw new ArgumentNullException(nameof(account));

            await _accountRepository.AddAsync(account);
        }
        public async Task<IEnumerable<Account>> GetAccountsByUserIdAsync(Guid userId)
        {
            return await _accountRepository.GetByUserIdAsync(userId);
        }


    }
}
