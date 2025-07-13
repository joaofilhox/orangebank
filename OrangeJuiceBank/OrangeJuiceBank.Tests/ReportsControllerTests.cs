using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using OrangeJuiceBank.API.Controllers;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain;
using OrangeJuiceBank.Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Xunit;

namespace OrangeJuiceBank.Tests
{
    public class ReportsControllerTests
    {
        private readonly Mock<IAccountRepository> _accountRepoMock = new();
        private readonly Mock<ITransactionRepository> _transactionRepoMock = new();

        private ReportsController CreateController(Guid userId)
        {
            var controller = new ReportsController(
                _accountRepoMock.Object,
                _transactionRepoMock.Object
            );

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        [Fact]
        public async Task GetInvestmentSummary_ShouldReturnInvestments()
        {
            // Arrange
            var userId = Guid.NewGuid();

            var accounts = new List<Account>
            {
                new Account
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = AccountType.Investimento,
                    Balance = 5000m,
                    Investments = new List<Investment>
                    {
                        new Investment
                        {
                            Id = Guid.NewGuid(),
                            Asset = new Asset
                            {
                                Id = Guid.NewGuid(),
                                Name = "Ação Teste",
                                Type = AssetType.Acao,
                                CurrentPrice = 120m
                            },
                            AssetId = Guid.NewGuid(),
                            Quantity = 10m,
                            AveragePrice = 100m
                        }
                    }
                }
            };

            _accountRepoMock.Setup(r => r.GetByUserIdAsync(userId))
                .ReturnsAsync(accounts);

            var controller = CreateController(userId);

            // Act
            var result = await controller.GetInvestmentsSummary();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsAssignableFrom<IEnumerable<InvestmentSummaryResponse>>(okResult.Value);

            var item = data.First();
            Assert.Equal("Ação Teste", item.AssetName);
            Assert.Equal(AssetType.Acao, item.AssetType);
            Assert.Equal(10m, item.Quantity);
            Assert.Equal(100m, item.AveragePrice);
            Assert.Equal(120m, item.CurrentPrice);
            Assert.Equal(1000m, item.TotalInvested);
            Assert.Equal(1200m, item.CurrentValue);
            Assert.Equal(200m, item.Profit);
        }
    }
}
