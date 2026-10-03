using Microsoft.EntityFrameworkCore;
using VietTrip.DestinationService.Models;

namespace VietTrip.DestinationService.Data
{
    public class DestinationDbContext : DbContext
    {
        public DestinationDbContext(
            DbContextOptions<DestinationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Destination> Destinations { get; set; }

        public DbSet<DestinationHighlight> DestinationHighlights
        {
            get; set;
        }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Destination
            modelBuilder.Entity<Destination>()
      .HasIndex(d => d.Slug)
      .IsUnique();

            modelBuilder.Entity<Destination>()
                .Property(d => d.Name)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Destination>()
                .Property(d => d.Slug)
                .HasMaxLength(250)
                .IsRequired();

            modelBuilder.Entity<Destination>()
                .Property(d => d.Region)
                .HasMaxLength(50);

            modelBuilder.Entity<Destination>()
                .Property(d => d.Country)
                .HasMaxLength(100);

            modelBuilder.Entity<Destination>()
                .Property(d => d.Province)
                .HasMaxLength(150);

            // DestinationHighlight
            modelBuilder.Entity<DestinationHighlight>()
                .Property(h => h.Title)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<DestinationHighlight>()
                .Property(h => h.Icon)
                .HasMaxLength(100);

            // Destination 1 - N Highlight
            modelBuilder.Entity<DestinationHighlight>()
                .HasOne(h => h.Destination)
                .WithMany(d => d.Highlights)
                .HasForeignKey(h => h.DestinationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}