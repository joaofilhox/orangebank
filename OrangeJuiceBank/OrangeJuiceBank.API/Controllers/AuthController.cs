using Microsoft.AspNetCore.Mvc;
using OrangeJuiceBank.API.Models;
using OrangeJuiceBank.Domain;
using OrangeJuiceBank.Domain.Repositories;
using System.Security.Cryptography;
using System.Text;

namespace OrangeJuiceBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            // Verifica se já existe usuário com este e-mail
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing != null)
                return BadRequest("Já existe um usuário com este e-mail.");

            // Gera hash e salt da senha
            CreatePasswordHash(request.Password, out byte[] hash, out byte[] salt);

            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                Cpf = request.Cpf,
                BirthDate = request.BirthDate,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            await _userRepository.AddAsync(user);

            return Ok("Usuário cadastrado com sucesso.");
        }

        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
