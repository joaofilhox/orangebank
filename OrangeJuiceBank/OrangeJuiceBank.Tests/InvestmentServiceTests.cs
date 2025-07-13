using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using OrangeJuiceBank.Domain;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Infrastructure.Services;
using Xunit;

namespace OrangeJuiceBank.Tests
{
    public class InvestmentServiceTests
    {
        private readonly Mock<IAccountRepository> _accountRepoMock = new();
        private readonly Mock<IAssetRepository> _assetRepoMock = new();
        private readonly Mock<IInvestmentRepository> _investmentRepoMock = new();
        private readonly Mock<ITransactionRepository> _transactionRepoMock = new();

        private InvestmentService CreateService() =>
            new InvestmentService(
                _accountRepoMock.Object,
                _assetRepoMock.Object,
                _investmentRepoMock.Object,
                _transactionRepoMock.Object
            );

        [Fact]
        public async Task BuyAsset_ShouldThrow_WhenAccountIsNotInvestment()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Corrente,
                Balance = 1000
            };

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                CurrentPrice = 10,
                Type = AssetType.Acao
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(account.Id))
                .ReturnsAsync(account);

            _assetRepoMock.Setup(r => r.GetByIdAsync(asset.Id))
                .ReturnsAsync(asset);

            var service = CreateService();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.BuyAssetAsync(account.UserId, account.Id, asset.Id, 1));

            Assert.Equal("Somente contas de investimento podem realizar compras de ativos.", ex.Message);
        }

        [Fact]
        public async Task BuyAsset_ShouldThrow_WhenBalanceIsInsufficient()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Investimento,
                Balance = 5
            };

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                CurrentPrice = 10,
                Type = AssetType.Acao
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(account.Id))
                .ReturnsAsync(account);

            _assetRepoMock.Setup(r => r.GetByIdAsync(asset.Id))
                .ReturnsAsync(asset);

            var service = CreateService();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.BuyAssetAsync(account.UserId, account.Id, asset.Id, 1));

            Assert.Equal("Saldo insuficiente.", ex.Message);
        }

        [Fact]
        public async Task BuyAsset_ShouldSucceed_WhenAccountIsInvestmentAndBalanceIsEnough()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Investimento,
                Balance = 1000,
                Investments = new List<Investment>()
            };

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                CurrentPrice = 10,
                Type = AssetType.Acao
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(account.Id))
                .ReturnsAsync(account);

            _assetRepoMock.Setup(r => r.GetByIdAsync(asset.Id))
                .ReturnsAsync(asset);

            _investmentRepoMock.Setup(r => r.AddAsync(It.IsAny<Investment>()))
                .Returns(Task.CompletedTask);

            _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);

            _accountRepoMock.Setup(r => r.UpdateAsync(account))
                .Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            await service.BuyAssetAsync(account.UserId, account.Id, asset.Id, 2);

            // Assert
            _investmentRepoMock.Verify(r => r.AddAsync(It.IsAny<Investment>()), Times.Once);
            _transactionRepoMock.Verify(r => r.AddAsync(It.IsAny<Transaction>()), Times.Once);
            _accountRepoMock.Verify(r => r.UpdateAsync(account), Times.Once);

            Assert.Equal(980, account.Balance); // 1000 - (2*10)
        }

        [Fact]
        public async Task SellAsset_ShouldCreditFullAmount_WhenNoProfit()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Investimento,
                Balance = 0,
                Investments = new List<Investment>()
            };

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                CurrentPrice = 10,
                Type = AssetType.Acao
            };

            var investment = new Investment
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                AssetId = asset.Id,
                Quantity = 5,
                AveragePrice = 12
            };

            account.Investments.Add(investment);

            _accountRepoMock.Setup(r => r.GetByIdAsync(account.Id))
                .ReturnsAsync(account);
            _assetRepoMock.Setup(r => r.GetByIdAsync(asset.Id))
                .ReturnsAsync(asset);
            _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _accountRepoMock.Setup(r => r.UpdateAsync(account))
                .Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            await service.SellAssetAsync(account.UserId, account.Id, asset.Id, 2);

            // Assert
            // Lucro negativo => imposto zero
            Assert.Equal(20, account.Balance);
        }

        [Fact]
        public async Task SellAsset_ShouldCreditNetAmount_WhenProfitOnStock()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Investimento,
                Balance = 0,
                Investments = new List<Investment>()
            };

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                CurrentPrice = 20,
                Type = AssetType.Acao
            };

            var investment = new Investment
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                AssetId = asset.Id,
                Quantity = 10,
                AveragePrice = 10
            };

            account.Investments.Add(investment);

            _accountRepoMock.Setup(r => r.GetByIdAsync(account.Id))
                .ReturnsAsync(account);
            _assetRepoMock.Setup(r => r.GetByIdAsync(asset.Id))
                .ReturnsAsync(asset);
            _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _accountRepoMock.Setup(r => r.UpdateAsync(account))
                .Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            await service.SellAssetAsync(account.UserId, account.Id, asset.Id, 2);

            // Assert
            // Lucro = (20-10)*2 =20
            // Imposto=3
            // Valor líquido=37
            Assert.Equal(37, account.Balance);
        }

        [Fact]
        public async Task SellAsset_ShouldCreditNetAmount_WhenProfitOnFixedIncome()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Investimento,
                Balance = 0,
                Investments = new List<Investment>()
            };

            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                CurrentPrice = 200,
                Type = AssetType.Cdb
            };

            var investment = new Investment
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                AssetId = asset.Id,
                Quantity = 1,
                AveragePrice = 100
            };

            account.Investments.Add(investment);

            _accountRepoMock.Setup(r => r.GetByIdAsync(account.Id))
                .ReturnsAsync(account);
            _assetRepoMock.Setup(r => r.GetByIdAsync(asset.Id))
                .ReturnsAsync(asset);
            _transactionRepoMock.Setup(r => r.AddAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _accountRepoMock.Setup(r => r.UpdateAsync(account))
                .Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            await service.SellAssetAsync(account.UserId, account.Id, asset.Id, 1);

            // Assert
            // Lucro=100
            // Imposto=22
            // Líquido=178
            Assert.Equal(178, account.Balance);
        }
    }
}
