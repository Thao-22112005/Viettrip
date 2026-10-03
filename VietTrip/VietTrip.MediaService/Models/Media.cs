using System.ComponentModel.DataAnnotations;

namespace VietTrip.MediaService.Models
{
    public class Media
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string PublicId { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Url { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Folder { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}