using System.ComponentModel.DataAnnotations;

namespace VietTrip.TourService.DTOs
{
    public class CreateTourRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        [Range(1, int.MaxValue)]
        public int DestinationId { get; set; }

        [Range(1, 365)]
        public int DurationDays { get; set; }
        public string? Departure { get; set; }
        public string? Transport { get; set; }

        [Range(0, 365)]
        public int DurationNights { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(1, 10000)]
        public int MaxPeople { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }
    }
}