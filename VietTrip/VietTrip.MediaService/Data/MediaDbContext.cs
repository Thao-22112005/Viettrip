using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using VietTrip.MediaService.Models;

namespace VietTrip.MediaService.Data
{
    public class MediaDbContext : DbContext
    {
        public MediaDbContext(
            DbContextOptions<MediaDbContext> options)
            : base(options)
        {
        }

        public DbSet<Media> Media { get; set; }
    }
}