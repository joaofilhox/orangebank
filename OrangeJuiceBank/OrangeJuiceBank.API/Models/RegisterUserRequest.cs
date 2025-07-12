namespace OrangeJuiceBank.API.Models
{
    public class RegisterUserRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Cpf { get; set; }
        public DateTime BirthDate { get; set; }
        public string Password { get; set; }
    }
}
