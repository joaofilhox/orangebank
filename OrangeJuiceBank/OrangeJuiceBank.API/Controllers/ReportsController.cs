using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain.Repositories;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;

        public ReportsController(
            IAccountRepository accountRepository,
            ITransactionRepository transactionRepository)
        {
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
        }

        [HttpGet("tax")]
        public async Task<IActionResult> GetTaxReport([FromQuery] int year)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            var accounts = await _accountRepository.GetByUserIdAsync(userId);
            var investmentAccounts = accounts.Where(a => a.Type == AccountType.Investimento).ToList();

            var reportItems = new List<TaxReportItemResponse>();

            foreach (var account in investmentAccounts)
            {
                var transactions = await _transactionRepository.GetByAccountIdAsync(account.Id);

                var sales = transactions
                    .Where(t => t.Type == TransactionType.VendaAtivo && t.Timestamp.Year == year)
                    .ToList();

                foreach (var sale in sales)
                {
                    var investment = account.Investments.FirstOrDefault(i => i.AssetId == sale.DestinationAccountId);
                    // Como no seu modelo a venda não salva AssetId no Transaction, 
                    // pode ser necessário ajustar ou guardar AssetId no futuro.

                    reportItems.Add(new TaxReportItemResponse
                    {
                        AssetName = "(Ativo não identificado)",
                        AssetType = AssetType.Acao, // ou outro tipo se tiver como identificar
                        SaleDate = sale.Timestamp,
                        Quantity = 0, // você não salva a quantidade na transação, considere adicionar
                        SalePrice = sale.Amount,
                        PurchasePrice = 0,
                        Profit = 0,
                        TaxRetained = 0
                    });
                }
            }

            return Ok(reportItems);
        }

        [HttpGet("investments")]
        public async Task<IActionResult> GetInvestmentsSummary()
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            var accounts = await _accountRepository.GetByUserIdAsync(userId);
            var investmentAccounts = accounts.Where(a => a.Type == AccountType.Investimento).ToList();

            var summaries = new List<InvestmentSummaryResponse>();

            foreach (var account in investmentAccounts)
            {
                foreach (var investment in account.Investments)
                {
                    var currentValue = investment.Quantity * investment.Asset.CurrentPrice;
                    var totalInvested = investment.Quantity * investment.AveragePrice;
                    var profit = currentValue - totalInvested;

                    summaries.Add(new InvestmentSummaryResponse
                    {
                        AssetName = investment.Asset.Name,
                        AssetType = investment.Asset.Type,
                        Quantity = investment.Quantity,
                        AveragePrice = investment.AveragePrice,
                        CurrentPrice = investment.Asset.CurrentPrice,
                        TotalInvested = totalInvested,
                        CurrentValue = currentValue,
                        Profit = profit
                    });
                }
            }

            return Ok(summaries);
        }
    }
}
