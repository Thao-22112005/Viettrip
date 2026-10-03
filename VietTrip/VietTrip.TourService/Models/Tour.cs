using System.ComponentModel.DataAnnotations;

namespace VietTrip.TourService.Models
{
    public class Tour
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        // Logical reference to Category Service
        public int CategoryId { get; set; }

        // Logical reference to Destination Service
        public int DestinationId { get; set; }

        // Nơi khởi hành
        [MaxLength(200)]
        public string? Departure { get; set; }

        // Phương tiện di chuyển
        [MaxLength(200)]
        public string? Transport { get; set; }

        [Range(1, 365)]
        public int DurationDays { get; set; }

        [Range(0, 365)]
        public int DurationNights { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(1, 10000)]
        public int MaxPeople { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<TourSchedule> TourSchedules { get; set; }
            = new List<TourSchedule>();

        public ICollection<Itinerary> Itineraries { get; set; }
            = new List<Itinerary>();

        public ICollection<TourImage> TourImages { get; set; }
            = new List<TourImage>();
    }
}