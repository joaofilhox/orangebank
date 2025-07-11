using System;
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
        public async Task TransferAsync_ShouldTransferAmountBetweenAccounts()
        {
            // Arrange
            var sourceAccountId = Guid.NewGuid();
            var destinationAccountId = Guid.NewGuid();

            var sourceAccount = new Account
            {
                Id = sourceAccountId,
                Balance = 200
            };

            var destinationAccount = new Account
            {
                Id = destinationAccountId,
                Balance = 100
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(sourceAccountId))
                .ReturnsAsync(sourceAccount);

            _accountRepoMock.Setup(r => r.GetByIdAsync(destinationAccountId))
                .ReturnsAsync(destinationAccount);

            // Act
            await _service.TransferAsync(sourceAccountId, destinationAccountId, 50);

            // Assert
            Assert.Equal(150, sourceAccount.Balance);
            Assert.Equal(150, destinationAccount.Balance);

            _transactionRepoMock.Verify(t => t.AddAsync(It.IsAny<Transaction>()), Times.Once);
            _accountRepoMock.Verify(r => r.UpdateAsync(sourceAccount), Times.Once);
            _accountRepoMock.Verify(r => r.UpdateAsync(destinationAccount), Times.Once);
        }
    }
}
