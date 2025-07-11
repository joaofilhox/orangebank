using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
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
    }

    public class TransferRequest
    {
        public Guid SourceAccountId { get; set; }
        public Guid DestinationAccountId { get; set; }
        public decimal Amount { get; set; }
    }
}
