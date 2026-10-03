using System.ComponentModel.DataAnnotations;

namespace VietTrip.ReviewService.DTOs
{
    public class CreateReviewRequest
    {
        [Range(1, int.MaxValue)]
        public int UserId { get; set; }

        [Range(1, int.MaxValue)]
        public int TourId { get; set; }

        [Range(1, int.MaxValue)]
        public int BookingId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;
    }
}