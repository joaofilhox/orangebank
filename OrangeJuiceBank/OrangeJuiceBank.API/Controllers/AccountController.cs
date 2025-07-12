using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🚨 Todas as rotas exigem token JWT
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

        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
        {
            var userId = GetUserId();

            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = request.Type,
                Balance = 0
            };

            await _accountService.CreateAccountAsync(account);

            return CreatedAtAction(nameof(GetBalance), new { id = account.Id }, new
            {
                account.Id,
                account.Type,
                account.Balance
            });
        }

        [HttpPost("{id}/deposit")]
        public async Task<IActionResult> Deposit(Guid id, [FromBody] decimal amount)
        {
            var userId = GetUserId();
            var account = await _accountService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound("Conta não encontrada.");

            if (account.UserId != userId)
                return Forbid("Esta conta não pertence ao usuário autenticado.");

            await _accountService.DepositAsync(id, amount);
            return Ok("Depósito realizado com sucesso.");
        }

        [HttpPost("{id}/withdraw")]
        public async Task<IActionResult> Withdraw(Guid id, [FromBody] decimal amount)
        {
            var userId = GetUserId();
            var account = await _accountService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound("Conta não encontrada.");

            if (account.UserId != userId)
                return Forbid("Esta conta não pertence ao usuário autenticado.");

            await _accountService.WithdrawAsync(id, amount);
            return Ok("Saque realizado com sucesso.");
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
        {
            var userId = GetUserId();

            // Verifica origem
            var source = await _accountService.GetAccountByIdAsync(request.SourceAccountId);
            if (source == null)
                return NotFound("Conta de origem não encontrada.");
            if (source.UserId != userId)
                return Forbid("A conta de origem não pertence ao usuário autenticado.");

            // Verifica destino (não precisa ser do mesmo usuário)
            var destination = await _accountService.GetAccountByIdAsync(request.DestinationAccountId);
            if (destination == null)
                return NotFound("Conta de destino não encontrada.");

            await _accountService.TransferAsync(request.SourceAccountId, request.DestinationAccountId, request.Amount);
            return Ok("Transferência realizada com sucesso.");
        }

        [HttpGet("{id}/balance")]
        public async Task<IActionResult> GetBalance(Guid id)
        {
            var userId = GetUserId();
            var account = await _accountService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound("Conta não encontrada.");

            if (account.UserId != userId)
                return Forbid("Esta conta não pertence ao usuário autenticado.");

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
            var userId = GetUserId();
            var account = await _accountService.GetAccountByIdAsync(id);
            if (account == null)
                return NotFound("Conta não encontrada.");

            if (account.UserId != userId)
                return Forbid("Esta conta não pertence ao usuário autenticado.");

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

        // Método helper para extrair o Guid do usuário logado
        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Usuário não autenticado.");
            return Guid.Parse(userIdClaim);
        }
    }

    public class TransferRequest
    {
        public Guid SourceAccountId { get; set; }
        public Guid DestinationAccountId { get; set; }
        public decimal Amount { get; set; }
    }
}
