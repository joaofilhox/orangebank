using Microsoft.AspNetCore.Mvc;
using Moq;
using OrangeJuiceBank.API.Controllers;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace OrangeJuiceBank.Tests
{
    public class InvestmentControllerTests
    {
        private readonly Mock<IInvestmentService> _investmentServiceMock;
        private readonly Mock<IAccountRepository> _accountRepositoryMock;
        private readonly InvestmentController _controller;

        public InvestmentControllerTests()
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
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext { User = principal }
            };
        }

        [Fact]
        public async Task BuyAsset_ShouldReturnOk_WhenBuySucceeds()
        {
            // Arrange
            var request = new BuyAssetRequest
            {
                AccountId = Guid.NewGuid(),
                AssetId = Guid.NewGuid(),
                Quantity = 10
            };

            // Act
            var result = await _controller.BuyAsset(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Compra realizada com sucesso.", okResult.Value);

            _investmentServiceMock.Verify(s =>
                s.BuyAssetAsync(It.IsAny<Guid>(), request.AccountId, request.AssetId, request.Quantity),
                Times.Once);
        }

        [Fact]
        public async Task SellAsset_ShouldReturnOk_WhenSellSucceeds()
        {
            // Arrange
            var request = new InvestmentController.SellAssetRequest
            {
                AccountId = Guid.NewGuid(),
                AssetId = Guid.NewGuid(),
                Quantity = 5
            };

            // Act
            var result = await _controller.SellAsset(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Venda realizada com sucesso.", okResult.Value);

            _investmentServiceMock.Verify(s =>
                s.SellAssetAsync(It.IsAny<Guid>(), request.AccountId, request.AssetId, request.Quantity),
                Times.Once);
        }
    }
}
