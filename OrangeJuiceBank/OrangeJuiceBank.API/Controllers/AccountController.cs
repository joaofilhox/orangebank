using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ITransactionRepository _transactionRepository;

        public AccountController(
     IAccountService accountService,
     ITransactionRepository transactionRepository)
        {
            _accountService = accountService;
            _transactionRepository = transactionRepository;
        }


        [HttpPost("{id}/deposit")]
        public async Task<IActionResult> Deposit(Guid id, [FromBody] decimal amount)
        {
            await _accountService.DepositAsync(id, amount);
            return Ok("Depósito realizado com sucesso.");
        }

        [HttpPost("{id}/withdraw")]
        public async Task<IActionResult> Withdraw(Guid id, [FromBody] decimal amount)
        {
            await _accountService.WithdrawAsync(id, amount);
            return Ok("Saque realizado com sucesso.");
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
        {
            await _accountService.TransferAsync(request.SourceAccountId, request.DestinationAccountId, request.Amount);
            return Ok("Transferência realizada com sucesso.");
        }

        [HttpGet("{id}/balance")]
        public async Task<IActionResult> GetBalance(Guid id)
        {
            var account = await _accountService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound("Conta não encontrada.");

            var response = new BalanceResponse
            {
                AccountId = account.Id,
                Balance = account.Balance
            };

            return Ok(response);
        }

        [HttpGet("{id}/statement")]
        public async Task<IActionResult> GetStatement(Guid id)
        {
            var account = await _accountService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound("Conta não encontrada.");

            var transactions = await _transactionRepository.GetByAccountIdAsync(id);

            var result = transactions.Select(t => new TransactionResponse
            {
                Id = t.Id,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                Timestamp = t.Timestamp
            });

            return Ok(result);
        }

    }

    public class TransferRequest
    {
        public Guid SourceAccountId { get; set; }
        public Guid DestinationAccountId { get; set; }
        public decimal Amount { get; set; }
    }
}
