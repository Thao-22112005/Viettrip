using Microsoft.EntityFrameworkCore;
using VietTrip.PaymentService.Models;

namespace VietTrip.PaymentService.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(
            DbContextOptions<PaymentDbContext> options)
            : base(options)
        {
        }

        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("Payments");

                entity.HasKey(p => p.Id);

                entity.Property(p => p.PaymentCode)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(p => p.PaymentCode)
                    .IsUnique();

                entity.Property(p => p.Amount)
                    .HasPrecision(18, 2);

                entity.Property(p => p.PaymentMethod)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(p => p.Status)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(p => p.TransactionId)
                    .HasMaxLength(150);

                entity.Property(p => p.CreatedAt)
                    .IsRequired();
            });
        }
    }
}