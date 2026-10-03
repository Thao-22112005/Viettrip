using System.ComponentModel.DataAnnotations;

namespace VietTrip.TourService.DTOs
{
    public class CreateItineraryRequest
    {
        [Range(1, int.MaxValue)]
        public int TourId { get; set; }

        [Range(1, 365)]
        public int DayNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }
    }
}