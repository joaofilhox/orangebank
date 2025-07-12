using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InvestmentController : ControllerBase
    {
        private readonly IInvestmentService _investmentService;

        private readonly IAccountRepository _accountRepository;

        public InvestmentController(
            IInvestmentService investmentService,
            IAccountRepository accountRepository)
        {
            _investmentService = investmentService;
            _accountRepository = accountRepository;
        }

        [HttpGet("portfolio")]
        public async Task<IActionResult> GetPortfolio()
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);

            var accounts = await _accountRepository.GetByUserIdAsync(userId);
            var investmentAccounts = accounts.Where(a => a.Type == AccountType.Investimento).ToList();

            var portfolio = new List<InvestmentPortfolioResponse>();

            foreach (var account in investmentAccounts)
            {
                foreach (var investment in account.Investments)
                {
                    portfolio.Add(new InvestmentPortfolioResponse
                    {
                        InvestmentId = investment.Id,
                        AccountId = investment.AccountId,
                        AssetName = investment.Asset.Name,
                        AssetType = investment.Asset.Type.ToString(),
                        Quantity = investment.Quantity,
                        AveragePrice = investment.AveragePrice,
                        CurrentPrice = investment.Asset.CurrentPrice
                    });
                }
            }

            return Ok(portfolio);
        }

        [HttpPost("buy")]
        public async Task<IActionResult> BuyAsset([FromBody] BuyAssetRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);

            await _investmentService.BuyAssetAsync(userId, request.AccountId, request.AssetId, request.Quantity);

            return Ok("Compra realizada com sucesso.");
        }

        [HttpPost("sell")]
        public async Task<IActionResult> SellAsset([FromBody] SellAssetRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);

            await _investmentService.SellAssetAsync(userId, request.AccountId, request.AssetId, request.Quantity);

            return Ok("Venda realizada com sucesso.");
        }

        public class SellAssetRequest
        {
            public Guid AccountId { get; set; }
            public Guid AssetId { get; set; }
            public decimal Quantity { get; set; }
        }

    }

    public class BuyAssetRequest
    {
        public Guid AccountId { get; set; }
        public Guid AssetId { get; set; }
        public decimal Quantity { get; set; }
    }
}
