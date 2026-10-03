using Microsoft.EntityFrameworkCore;
using VietTrip.AuthService.Models;

namespace VietTrip.AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<OtpCode> OtpCodes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasKey(u => u.Id);

                entity.Property(u => u.FullName)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(u => u.Email)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.HasIndex(u => u.Email)
                    .IsUnique();

                entity.Property(u => u.PasswordHash)
                    .IsRequired();

                entity.Property(u => u.Status)
                    .HasMaxLength(20)
                    .IsRequired()
                    .HasDefaultValue("Active");
            });

            modelBuilder.Entity<OtpCode>(entity =>
            {
                entity.ToTable("OtpCodes");

                entity.HasKey(o => o.Id);

                entity.Property(o => o.Code)
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(o => o.Purpose)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasOne(o => o.User)
                    .WithMany(u => u.OtpCodes)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

            });
        }
    }
}