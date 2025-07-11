using Microsoft.EntityFrameworkCore;
using OrangeJuiceBank.Domain.Repositories;
using OrangeJuiceBank.Domain.Services;
using OrangeJuiceBank.Infrastructure.Data;
using OrangeJuiceBank.Infrastructure.Repositories;
using OrangeJuiceBank.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Adiciona ApplicationDbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();

builder.Services.AddScoped<IAccountService, AccountService>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
