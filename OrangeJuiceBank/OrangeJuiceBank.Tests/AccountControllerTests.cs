using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Controllers;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.Tests
{
    public class AccountControllerTests
    {
        private readonly Mock<IAccountService> _accountServiceMock;
        private readonly Mock<ITransactionRepository> _transactionRepoMock;
        private readonly AccountController _controller;

        public AccountControllerTests()
        {
            _accountServiceMock = new Mock<IAccountService>();
            _transactionRepoMock = new Mock<ITransactionRepository>();

            _controller = new AccountController(
                _accountServiceMock.Object,
                _transactionRepoMock.Object
            );
        }

        [Fact]
        public async Task GetStatement_ShouldReturnTransactions()
        {
            // Arrange
            var accountId = Guid.NewGuid();

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync(new Account { Id = accountId });

            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    Type = TransactionType.Deposito,
                    Amount = 100,
                    Timestamp = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    Type = TransactionType.Saque,
                    Amount = 50,
                    Timestamp = DateTime.UtcNow.AddMinutes(-5)
                }
            };

            _transactionRepoMock.Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync(transactions);

            // Act
            var result = await _controller.GetStatement(accountId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var response = Assert.IsAssignableFrom<IEnumerable<TransactionResponse>>(result.Value);
            Assert.Equal(2, response.Count());
        }

        [Fact]
        public async Task GetStatement_ShouldReturnNotFound_WhenAccountDoesNotExist()
        {
            // Arrange
            var accountId = Guid.NewGuid();

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync((Account)null);

            // Act
            var result = await _controller.GetStatement(accountId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
