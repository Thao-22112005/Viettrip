using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VietTrip.TourService.Models
{
    public class Itinerary
    {
        public int Id { get; set; }

        public int TourId { get; set; }

        [Range(1, 365)]
        public int DayNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [JsonIgnore]
        public Tour Tour { get; set; } = null!;
    }
}