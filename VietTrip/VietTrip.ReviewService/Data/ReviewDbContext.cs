using Microsoft.EntityFrameworkCore;
using VietTrip.ReviewService.Models;

namespace VietTrip.ReviewService.Data
{
    public class ReviewDbContext : DbContext
    {
        public ReviewDbContext(
            DbContextOptions<ReviewDbContext> options)
            : base(options)
        {
        }

        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("Reviews");

                entity.HasKey(r => r.Id);

                entity.Property(r => r.Comment)
                    .HasMaxLength(2000)
                    .IsRequired();

                entity.Property(r => r.Rating)
                    .IsRequired();

                entity.Property(r => r.IsActive)
                    .HasDefaultValue(true);

                entity.Property(r => r.CreatedAt)
                    .IsRequired();

                //Một user chỉ được review một booking
                entity.HasIndex(r => new
                {
                    r.UserId,
                    r.BookingId
                })
                .IsUnique();
            });
        }
    }
}