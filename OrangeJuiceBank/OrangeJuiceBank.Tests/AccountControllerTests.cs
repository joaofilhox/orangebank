using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using OrangeJuiceBank.API.Controllers;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.Tests
{
    public class AccountControllerTests
    {
        private readonly Mock<IAccountService> _accountServiceMock;
        private readonly Mock<ITransactionRepository> _transactionRepoMock;
        private readonly AccountController _controller;

        private void SetUser(Guid userId)
        {
            var claims = new List<System.Security.Claims.Claim>
            {
                new(System.Security.Claims.ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new System.Security.Claims.ClaimsIdentity(claims, "TestAuthType");
            var principal = new System.Security.Claims.ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

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
        public async Task GetBalance_ShouldReturnBalance_WhenAccountExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var account = new Account
            {
                Id = accountId,
                Balance = 150.75m,
                UserId = userId
            };

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync(account);

            SetUser(userId);

            // Act
            var result = await _controller.GetBalance(accountId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var response = Assert.IsType<BalanceResponse>(result.Value);
            Assert.Equal(accountId, response.AccountId);
            Assert.Equal(150.75m, response.Balance);
        }

        [Fact]
        public async Task GetBalance_ShouldReturnNotFound_WhenAccountDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync((Account?)null);

            SetUser(userId);

            // Act
            var result = await _controller.GetBalance(accountId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetStatement_ShouldReturnTransactions()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync(new Account { Id = accountId, UserId = userId });

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

            SetUser(userId);

            // Act
            var result = await _controller.GetStatement(accountId, null, null);

            // Assert
            Assert.NotNull(result);
            var response = Assert.IsAssignableFrom<IEnumerable<TransactionResponse>>(((OkObjectResult)result).Value);
            Assert.Equal(2, response.Count());
        }

        [Fact]
        public async Task GetStatement_ShouldReturnNotFound_WhenAccountDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync((Account?)null);

            SetUser(userId);

            // Act
            var result = await _controller.GetStatement(accountId, null, null);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Deposit_ShouldReturnOk_WhenDepositSucceeds()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            decimal amount = 500m;

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync(new Account
                {
                    Id = accountId,
                    UserId = userId
                });

            SetUser(userId);

            // Act
            var result = await _controller.Deposit(accountId, amount);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Depósito realizado com sucesso.", okResult.Value);

            _accountServiceMock.Verify(s => s.DepositAsync(accountId, amount), Times.Once);
        }

        [Fact]
        public async Task Withdraw_ShouldReturnOk_WhenWithdrawSucceeds()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            decimal amount = 200m;

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync(new Account
                {
                    Id = accountId,
                    UserId = userId
                });

            SetUser(userId);

            // Act
            var result = await _controller.Withdraw(accountId, amount);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Saque realizado com sucesso.", okResult.Value);

            _accountServiceMock.Verify(s => s.WithdrawAsync(accountId, amount), Times.Once);
        }

        [Fact]
        public async Task Transfer_ShouldReturnOk_WhenTransferSucceeds()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var sourceAccountId = Guid.NewGuid();
            var destinationAccountId = Guid.NewGuid();

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(sourceAccountId))
                .ReturnsAsync(new Account
                {
                    Id = sourceAccountId,
                    UserId = userId
                });

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(destinationAccountId))
                .ReturnsAsync(new Account
                {
                    Id = destinationAccountId,
                    UserId = Guid.NewGuid()
                });

            SetUser(userId);

            var request = new TransferRequest
            {
                SourceAccountId = sourceAccountId,
                DestinationAccountId = destinationAccountId,
                Amount = 300m
            };

            // Act
            var result = await _controller.Transfer(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Transferência realizada com sucesso.", okResult.Value);

            _accountServiceMock.Verify(s =>
                s.TransferAsync(request.SourceAccountId, request.DestinationAccountId, request.Amount),
                Times.Once);
        }

        [Fact]
        public async Task CreateAccount_ShouldReturnCreated_WhenAccountIsCreated()
        {
            // Arrange
            var userId = Guid.NewGuid();

            SetUser(userId);

            var request = new CreateAccountRequest
            {
                Type = AccountType.Corrente
            };

            Account capturedAccount = null;

            _accountServiceMock
                .Setup(s => s.CreateAccountAsync(It.IsAny<Account>()))
                .Callback<Account>(a => capturedAccount = a)
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreateAccount(request);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);

            Assert.NotNull(createdResult.Value);

            Assert.NotNull(capturedAccount);
            Assert.Equal(userId, capturedAccount.UserId);
            Assert.Equal(AccountType.Corrente, capturedAccount.Type);
            Assert.Equal(0m, capturedAccount.Balance);

            _accountServiceMock.Verify(s => s.CreateAccountAsync(It.IsAny<Account>()), Times.Once);
        }

        [Fact]
        public async Task GetAccounts_ShouldReturnAccountsOfAuthenticatedUser()
        {
            // Arrange
            var userId = Guid.NewGuid();

            SetUser(userId);

            var accounts = new List<Account>
            {
                new Account
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = AccountType.Corrente,
                    Balance = 500m
                },
                new Account
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = AccountType.Investimento,
                    Balance = 1000m
                }
            };

            _accountServiceMock.Setup(s => s.GetAccountsByUserIdAsync(userId))
                .ReturnsAsync(accounts);

            // Act
            var result = await _controller.GetAccounts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsAssignableFrom<IEnumerable<AccountSummaryResponse>>(okResult.Value);

            Assert.Equal(2, response.Count());

            var accountList = response.ToList();

            Assert.Equal(accounts[0].Id, accountList[0].Id);
            Assert.Equal(accounts[0].Type, accountList[0].Type);
            Assert.Equal(accounts[0].Balance, accountList[0].Balance);

            Assert.Equal(accounts[1].Id, accountList[1].Id);
            Assert.Equal(accounts[1].Type, accountList[1].Type);
            Assert.Equal(accounts[1].Balance, accountList[1].Balance);

            _accountServiceMock.Verify(s => s.GetAccountsByUserIdAsync(userId), Times.Once);
        }

        [Fact]
        public async Task GetStatement_ShouldReturnTransactionsFilteredByDate()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            var baseDate = new DateTime(2024, 1, 15);

            _accountServiceMock.Setup(s => s.GetAccountByIdAsync(accountId))
                .ReturnsAsync(new Account { Id = accountId, UserId = userId });

            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    Type = TransactionType.Deposito,
                    Amount = 100,
                    Timestamp = baseDate.AddDays(-10)
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    Type = TransactionType.Saque,
                    Amount = 50,
                    Timestamp = baseDate
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    Type = TransactionType.TransferenciaInterna,
                    Amount = 200,
                    Timestamp = baseDate.AddDays(5)
                }
            };

            _transactionRepoMock.Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync(transactions);

            SetUser(userId);

            var from = baseDate.AddDays(-1);
            var to = baseDate.AddDays(6);

            // Act
            var result = await _controller.GetStatement(accountId, from, to);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsAssignableFrom<IEnumerable<TransactionResponse>>(okResult.Value);

            Assert.Equal(2, response.Count());
            Assert.All(response, t =>
            {
                Assert.InRange(t.Timestamp, from, to);
            });
        }
    }
}
