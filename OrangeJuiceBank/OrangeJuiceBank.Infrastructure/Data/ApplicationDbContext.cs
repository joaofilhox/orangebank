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
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Boi Bom",
                    Type = AssetType.Acao,
                    CurrentPrice = 25.50m
                },
                new Asset
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "NuvemCinza",
                    Type = AssetType.Acao,
                    CurrentPrice = 120.45m
                },
                new Asset
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "CDB Banco A",
                    Type = AssetType.Cdb,
                    CurrentPrice = 1000.00m
                },
                 new Asset
                 {
                     Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                     Name = "Tesouro Selic 2025",
                     Type = AssetType.TesouroDireto,
                     CurrentPrice = 100.00m
                 }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}
