using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VietTrip.TourService.Models
{
    public class TourImage
    {
        public int Id { get; set; }

        public int TourId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string PublicId { get; set; } = string.Empty;

        public int DisplayOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [JsonIgnore]
        public Tour Tour { get; set; } = null!;
    }
}