using Microsoft.EntityFrameworkCore;
using VietTrip.BookingService.Models;

namespace VietTrip.BookingService.Data
{
    public class BookingDbContext : DbContext
    {
        public BookingDbContext(
            DbContextOptions<BookingDbContext> options)
            : base(options)
        {
        }

        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.ToTable("Bookings");

                entity.HasKey(b => b.Id);

                entity.Property(b => b.BookingCode)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(b => b.BookingCode)
                    .IsUnique();

                entity.Property(b => b.Status)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(b => b.CustomerName)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(b => b.CustomerEmail)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(b => b.CustomerPhone)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(b => b.Note)
                    .HasMaxLength(1000);

                entity.Property(b => b.UnitPrice)
                    .HasPrecision(18, 2);

                entity.Property(b => b.TotalAmount)
                    .HasPrecision(18, 2);

                entity.Property(b => b.CreatedAt)
                    .IsRequired();
            });
        }
    }
}