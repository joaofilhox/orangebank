using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using OrangeJuiceBank.API.Controllers;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;
using Xunit;

namespace OrangeJuiceBank.Tests
{
    public class InvestmentControllerTests_Portfolio
    {
        private readonly Mock<IInvestmentService> _investmentServiceMock;
        private readonly Mock<IAccountRepository> _accountRepositoryMock;
        private readonly InvestmentController _controller;

        public InvestmentControllerTests_Portfolio()
        {
            _investmentServiceMock = new Mock<IInvestmentService>();
            _accountRepositoryMock = new Mock<IAccountRepository>();

            _controller = new InvestmentController(
                _investmentServiceMock.Object,
                _accountRepositoryMock.Object
            );

            // Mock do usuário autenticado
            var userId = Guid.NewGuid();
            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new System.Security.Claims.ClaimsIdentity(claims, "TestAuth");
            var principal = new System.Security.Claims.ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            // Guardar userId em campo para uso nos testes
            UserId = userId;
        }

        public Guid UserId { get; }

        [Fact]
        public async Task GetPortfolio_ShouldReturnInvestments()
        {
            // Arrange
            var asset = new Asset
            {
                Name = "Ação XPTO",
                Type = AssetType.Acao,
                CurrentPrice = 50.0m
            };

            var investment = new Investment
            {
                Quantity = 10,
                AveragePrice = 45.0m,
                CreatedAt = DateTime.UtcNow,
                Asset = asset
            };

            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = UserId,
                Type = AccountType.Investimento,
                Investments = new List<Investment> { investment },
                Transactions = new List<Transaction>()
            };

            _accountRepositoryMock.Setup(r => r.GetByUserIdAsync(UserId))
                .ReturnsAsync(new List<Account> { account });

            // Act
            var result = await _controller.GetPortfolio();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var portfolio = Assert.IsAssignableFrom<IEnumerable<InvestmentPortfolioResponse>>(okResult.Value);

            var investmentResponse = portfolio.First();
            Assert.Equal("Ação XPTO", investmentResponse.AssetName);
            Assert.Equal("Acao", investmentResponse.AssetType);
            Assert.Equal(10, investmentResponse.Quantity);
            Assert.Equal(45.0m, investmentResponse.AveragePrice);
            Assert.Equal(50.0m, investmentResponse.CurrentPrice);
        }

        [Fact]
        public async Task GetPortfolio_ShouldReturnEmptyList_WhenNoInvestments()
        {
            // Arrange
            _accountRepositoryMock.Setup(r => r.GetByUserIdAsync(UserId))
                .ReturnsAsync(new List<Account>());

            // Act
            var result = await _controller.GetPortfolio();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var portfolio = Assert.IsAssignableFrom<IEnumerable<InvestmentPortfolioResponse>>(okResult.Value);

            Assert.Empty(portfolio);
        }
    }
}
