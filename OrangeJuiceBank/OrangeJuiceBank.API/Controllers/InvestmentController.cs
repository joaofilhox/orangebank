using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InvestmentController : ControllerBase
    {
        private readonly IInvestmentService _investmentService;

        public InvestmentController(IInvestmentService investmentService)
        {
            _investmentService = investmentService;
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
