using Microsoft.EntityFrameworkCore;
using VietTrip.CategoryService.Models;

namespace VietTrip.CategoryService.Data
{
    public class CategoryDbContext : DbContext
    {
        public CategoryDbContext(
            DbContextOptions<CategoryDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");

                entity.HasKey(c => c.Id);

                entity.Property(c => c.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(c => c.Description)
                    .HasMaxLength(500);

                entity.Property(c => c.ImageUrl).HasMaxLength(500);

                entity.Property(c => c.IsActive)
                    .HasDefaultValue(true);

                entity.Property(c => c.CreatedAt)
                    .IsRequired();
            });
        }
    }
}