using Microsoft.EntityFrameworkCore;

namespace OrangeJuiceBank.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<Investment> Investments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>()
                .Property(e => e.Type)
                .HasConversion<int>();

            modelBuilder.Entity<Transaction>()
                .Property(e => e.Type)
                .HasConversion<int>();

            modelBuilder.Entity<Asset>()
                .Property(e => e.Type)
                .HasConversion<int>();

            modelBuilder.Entity<Account>()
                .HasMany(a => a.Investments)
                .WithOne(i => i.Account)
                .HasForeignKey(i => i.AccountId);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.SourceAccount)
                .WithMany()
                .HasForeignKey(t => t.SourceAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.DestinationAccount)
                .WithMany()
                .HasForeignKey(t => t.DestinationAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Account>()
                .Property(a => a.Balance)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Asset>()
                .Property(a => a.CurrentPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Investment>()
                .Property(i => i.AveragePrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Investment>()
                .Property(i => i.Quantity)
                .HasPrecision(18, 4);

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Asset>().HasData(
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000001"),
                    Name = "Boi Bom",
                    Type = AssetType.Acao,
                    CurrentPrice = 25.50m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000002"),
                    Name = "Boi Nobre",
                    Type = AssetType.Acao,
                    CurrentPrice = 18.75m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000003"),
                    Name = "Água pra Todos",
                    Type = AssetType.Acao,
                    CurrentPrice = 42.30m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000004"),
                    Name = "Energia BR",
                    Type = AssetType.Acao,
                    CurrentPrice = 35.80m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000005"),
                    Name = "NuvemCinza",
                    Type = AssetType.Acao,
                    CurrentPrice = 120.45m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000006"),
                    Name = "ChipZilla",
                    Type = AssetType.Acao,
                    CurrentPrice = 95.60m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000007"),
                    Name = "Soja Brasil",
                    Type = AssetType.Acao,
                    CurrentPrice = 32.40m
                },
                new Asset
                {
                    Id = Guid.Parse("11111111-1111-0000-0000-000000000008"),
                    Name = "Café Premium",
                    Type = AssetType.Acao,
                    CurrentPrice = 28.90m
                },
                new Asset
                {
                    Id = Guid.Parse("22222222-2222-0000-0000-000000000001"),
                    Name = "CDB Banco A",
                    Type = AssetType.Cdb,
                    CurrentPrice = 1000.00m
                },
                new Asset
                {
                    Id = Guid.Parse("22222222-2222-0000-0000-000000000002"),
                    Name = "CDB Banco B",
                    Type = AssetType.Cdb,
                    CurrentPrice = 5000.00m
                },
                new Asset
                {
                    Id = Guid.Parse("22222222-2222-0000-0000-000000000003"),
                    Name = "CDB Banco C",
                    Type = AssetType.Cdb,
                    CurrentPrice = 2000.00m
                },
                new Asset
                {
                    Id = Guid.Parse("33333333-3333-0000-0000-000000000001"),
                    Name = "Tesouro Selic 2025",
                    Type = AssetType.TesouroDireto,
                    CurrentPrice = 100.00m
                },
                new Asset
                {
                    Id = Guid.Parse("33333333-3333-0000-0000-000000000002"),
                    Name = "Tesouro IPCA+ 2026",
                    Type = AssetType.TesouroDireto,
                    CurrentPrice = 100.00m
                },
                new Asset
                {
                    Id = Guid.Parse("33333333-3333-0000-0000-000000000003"),
                    Name = "Tesouro Prefixado 2027",
                    Type = AssetType.TesouroDireto,
                    CurrentPrice = 100.00m
                }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}
