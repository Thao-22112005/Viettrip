using Microsoft.EntityFrameworkCore;
using VietTrip.TourService.Models;

namespace VietTrip.TourService.Data
{
    public class TourDbContext : DbContext
    {
        public TourDbContext(
            DbContextOptions<TourDbContext> options)
            : base(options)
        {
        }

        public DbSet<Tour> Tours { get; set; }

        public DbSet<TourSchedule> TourSchedules { get; set; }

        public DbSet<Itinerary> Itineraries { get; set; }

        public DbSet<TourImage> TourImages { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tour>(entity =>
            {
                entity.ToTable("Tours");

                entity.HasKey(t => t.Id);

                entity.Property(t => t.Name)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(t => t.Description)
                    .HasMaxLength(2000);

                entity.Property(t => t.Price)
                    .HasPrecision(18, 2);

                entity.Property(t => t.CoverImageUrl)
                    .HasMaxLength(500);

                entity.Property(t => t.IsActive)
                    .HasDefaultValue(true);

                entity.Property(t => t.CreatedAt)
                    .IsRequired();

                // CategoryId và DestinationId
                // chỉ là logical references.
                // Không tạo FK sang service khác.

                entity.HasMany(t => t.TourSchedules)
                    .WithOne(s => s.Tour)
                    .HasForeignKey(s => s.TourId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.Itineraries)
                    .WithOne(i => i.Tour)
                    .HasForeignKey(i => i.TourId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TourSchedule>(entity =>
            {
                entity.ToTable("TourSchedules");

                entity.HasKey(s => s.Id);

                entity.Property(s => s.IsActive)
                    .HasDefaultValue(true);

                entity.Property(s => s.CreatedAt)
                    .IsRequired();
            });

            modelBuilder.Entity<Itinerary>(entity =>
            {
                entity.ToTable("Itineraries");

                entity.HasKey(i => i.Id);

                entity.Property(i => i.Title)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(i => i.Description)
                    .HasMaxLength(2000);
            });

            modelBuilder.Entity<TourImage>(entity =>
            {
                entity.ToTable("TourImages");

                entity.HasKey(i => i.Id);

                entity.Property(i => i.ImageUrl)
                    .HasMaxLength(500)
                    .IsRequired();

                entity.Property(i => i.PublicId)
                    .HasMaxLength(300)
                    .IsRequired();

                entity.Property(i => i.IsActive)
                    .HasDefaultValue(true);

                entity.Property(i => i.CreatedAt)
                    .IsRequired();

                entity.HasOne(i => i.Tour)
                    .WithMany(t => t.TourImages)
                    .HasForeignKey(i => i.TourId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}