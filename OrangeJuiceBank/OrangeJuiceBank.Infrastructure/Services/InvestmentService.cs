using Microsoft.EntityFrameworkCore;
using OrangeJuiceBank.Domain;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.Infrastructure.Services
{
    public class InvestmentService : IInvestmentService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IAssetRepository _assetRepository;
        private readonly IInvestmentRepository _investmentRepository;
        private readonly ITransactionRepository _transactionRepository;

        public InvestmentService(
            IAccountRepository accountRepository,
            IAssetRepository assetRepository,
            IInvestmentRepository investmentRepository,
            ITransactionRepository transactionRepository)
        {
            _accountRepository = accountRepository;
            _assetRepository = assetRepository;
            _investmentRepository = investmentRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task BuyAssetAsync(Guid userId, Guid accountId, Guid assetId, decimal quantity)
        {
            if (quantity <= 0)
                throw new InvalidOperationException("A quantidade deve ser positiva.");

            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
                throw new InvalidOperationException("Conta não encontrada.");

            if (account.UserId != userId)
                throw new InvalidOperationException("Conta não pertence ao usuário.");

            if (account.Type != AccountType.Investimento)
                throw new InvalidOperationException("Somente contas de investimento podem realizar compras de ativos.");

            var asset = await _assetRepository.GetByIdAsync(assetId);
            if (asset == null)
                throw new InvalidOperationException("Ativo não encontrado.");

            var totalPrice = quantity * asset.CurrentPrice;

            // Validação de mínimo investimento
            if (asset.Type == AssetType.Cdb && totalPrice < 1000)
                throw new InvalidOperationException("Compra mínima para CDB é R$1000.");

            if (asset.Type == AssetType.TesouroDireto && totalPrice < 100)
                throw new InvalidOperationException("Compra mínima para Tesouro Direto é R$100.");

            if (account.Balance < totalPrice)
                throw new InvalidOperationException("Saldo insuficiente.");

            account.Balance -= totalPrice;

            var existingInvestment = account.Investments?.FirstOrDefault(i => i.AssetId == assetId);

            if (existingInvestment != null)
            {
                var totalQuantity = existingInvestment.Quantity + quantity;
                var totalInvested = (existingInvestment.Quantity * existingInvestment.AveragePrice) + totalPrice;
                existingInvestment.Quantity = totalQuantity;
                existingInvestment.AveragePrice = totalInvested / totalQuantity;
            }
            else
            {
                var investment = new Investment
                {
                    Id = Guid.NewGuid(),
                    AccountId = accountId,
                    AssetId = assetId,
                    Quantity = quantity,
                    AveragePrice = asset.CurrentPrice,
                    CreatedAt = DateTime.UtcNow
                };
                await _investmentRepository.AddAsync(investment);
            }

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.CompraAtivo,
                Amount = totalPrice,
                Timestamp = DateTime.UtcNow,
                SourceAccountId = accountId
            };

            await _transactionRepository.AddAsync(transaction);
            await _accountRepository.UpdateAsync(account);
        }
        public async Task SellAssetAsync(Guid userId, Guid accountId, Guid assetId, decimal quantity)
        {
            if (quantity <= 0)
                throw new InvalidOperationException("A quantidade deve ser positiva.");

            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
                throw new InvalidOperationException("Conta não encontrada.");

            if (account.UserId != userId)
                throw new InvalidOperationException("Conta não pertence ao usuário.");

            if (account.Type != AccountType.Investimento)
                throw new InvalidOperationException("Somente contas de investimento podem realizar venda de ativos.");

            var asset = await _assetRepository.GetByIdAsync(assetId);
            if (asset == null)
                throw new InvalidOperationException("Ativo não encontrado.");

            var investment = account.Investments?.FirstOrDefault(i => i.AssetId == assetId);
            if (investment == null)
                throw new InvalidOperationException("O investimento não existe nesta conta.");

            if (investment.Quantity < quantity)
                throw new InvalidOperationException("Quantidade insuficiente para venda.");

            var totalValue = quantity * asset.CurrentPrice;

            investment.Quantity -= quantity;

            if (investment.Quantity == 0)
            {
                await _investmentRepository.RemoveAsync(investment);
            }
            else
            {
                await _accountRepository.UpdateAsync(account);
            }

            account.Balance += totalValue;

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                Type = TransactionType.VendaAtivo,
                Amount = totalValue,
                Timestamp = DateTime.UtcNow,
                SourceAccountId = accountId
            };

            await _transactionRepository.AddAsync(transaction);
            await _accountRepository.UpdateAsync(account);
        }
    }
}
