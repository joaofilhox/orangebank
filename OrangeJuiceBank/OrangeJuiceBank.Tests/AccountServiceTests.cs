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
    public class AccountServiceTests
    {
        private readonly Mock<IAccountRepository> _accountRepoMock;
        private readonly Mock<ITransactionRepository> _transactionRepoMock;
        private readonly AccountService _service;

        public AccountServiceTests()
        {
            _accountRepoMock = new Mock<IAccountRepository>();
            _transactionRepoMock = new Mock<ITransactionRepository>();
            _service = new AccountService(_accountRepoMock.Object, _transactionRepoMock.Object);
        }

        [Fact]
        public async Task DepositAsync_ShouldIncreaseBalance()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var account = new Account
            {
                Id = accountId,
                Type = AccountType.Corrente,
                Balance = 100
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(accountId))
                .ReturnsAsync(account);

            // Act
            await _service.DepositAsync(accountId, 50);

            // Assert
            Assert.Equal(150, account.Balance);
            _transactionRepoMock.Verify(t => t.AddAsync(It.IsAny<Transaction>()), Times.Once);
            _accountRepoMock.Verify(r => r.UpdateAsync(account), Times.Once);
        }

        [Fact]
        public async Task DepositAsync_ShouldThrow_WhenAmountIsNegative()
        {
            // Arrange
            var accountId = Guid.NewGuid();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.DepositAsync(accountId, -10));

            Assert.Equal("O valor do depósito deve ser positivo.", ex.Message);
        }

        [Fact]
        public async Task WithdrawAsync_ShouldDecreaseBalance()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var account = new Account
            {
                Id = accountId,
                Type = AccountType.Corrente,
                Balance = 100
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(accountId))
                .ReturnsAsync(account);

            // Act
            await _service.WithdrawAsync(accountId, 50);

            // Assert
            Assert.Equal(50, account.Balance);
            _transactionRepoMock.Verify(t => t.AddAsync(It.IsAny<Transaction>()), Times.Once);
            _accountRepoMock.Verify(r => r.UpdateAsync(account), Times.Once);
        }

        [Fact]
        public async Task TransferAsync_ShouldTransferWithoutFee_WhenInternal()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var source = new Account
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = AccountType.Corrente,
                Balance = 500m
            };

            var destination = new Account
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = AccountType.Investimento,
                Balance = 0m
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(source.Id))
                .ReturnsAsync(source);
            _accountRepoMock.Setup(r => r.GetByIdAsync(destination.Id))
                .ReturnsAsync(destination);

            // Act
            await _service.TransferAsync(source.Id, destination.Id, 200m);

            // Assert
            Assert.Equal(300m, source.Balance);
            Assert.Equal(200m, destination.Balance);

            _transactionRepoMock.Verify(t => t.AddAsync(It.Is<Transaction>(x =>
                x.Type == TransactionType.TransferenciaInterna &&
                x.Amount == 200m
            )), Times.Once);
        }

        [Fact]
        public async Task TransferAsync_ShouldApplyFee_WhenExternal()
        {
            // Arrange
            var source = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Corrente,
                Balance = 1000m
            };

            var destination = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Corrente,
                Balance = 0m
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(source.Id))
                .ReturnsAsync(source);
            _accountRepoMock.Setup(r => r.GetByIdAsync(destination.Id))
                .ReturnsAsync(destination);

            // Act
            await _service.TransferAsync(source.Id, destination.Id, 200m);

            // Assert
            Assert.Equal(799m, source.Balance); // 200 + 1 taxa
            Assert.Equal(200m, destination.Balance);

            _transactionRepoMock.Verify(t => t.AddAsync(It.Is<Transaction>(x =>
                x.Type == TransactionType.TransferenciaExterna &&
                x.Amount == 200m
            )), Times.Once);
        }

        [Fact]
        public async Task TransferAsync_ShouldThrow_WhenBalanceInsufficient()
        {
            // Arrange
            var source = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Corrente,
                Balance = 50m
            };

            var destination = new Account
            {
                Id = Guid.NewGuid(),
                UserId = source.UserId,
                Type = AccountType.Corrente,
                Balance = 0m
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(source.Id))
                .ReturnsAsync(source);
            _accountRepoMock.Setup(r => r.GetByIdAsync(destination.Id))
                .ReturnsAsync(destination);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.TransferAsync(source.Id, destination.Id, 100m));
        }

        [Fact]
        public async Task TransferAsync_ShouldThrow_WhenInvestmentAccountHasInvestments()
        {
            // Arrange
            var userId = Guid.NewGuid();

            var source = new Account
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = AccountType.Investimento,
                Balance = 500m,
                Investments = new List<Investment>
                {
                    new Investment { Id = Guid.NewGuid(), Quantity = 1 }
                }
            };

            var destination = new Account
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = AccountType.Corrente,
                Balance = 0m
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(source.Id))
                .ReturnsAsync(source);
            _accountRepoMock.Setup(r => r.GetByIdAsync(destination.Id))
                .ReturnsAsync(destination);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.TransferAsync(source.Id, destination.Id, 100m));
        }

        [Fact]
        public async Task TransferAsync_ShouldThrow_WhenExternalTransferNotCorrente()
        {
            // Arrange
            var source = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Investimento,
                Balance = 1000m
            };

            var destination = new Account
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Type = AccountType.Corrente,
                Balance = 0m
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(source.Id))
                .ReturnsAsync(source);
            _accountRepoMock.Setup(r => r.GetByIdAsync(destination.Id))
                .ReturnsAsync(destination);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.TransferAsync(source.Id, destination.Id, 100m));
        }

        [Fact]
        public async Task TransferAsync_ShouldThrow_WhenSameAccount()
        {
            // Arrange
            var accountId = Guid.NewGuid();

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.TransferAsync(accountId, accountId, 100m));
        }
    }
}
