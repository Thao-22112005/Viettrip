using System.ComponentModel.DataAnnotations;

namespace VietTrip.ReviewService.DTOs
{
    public class UpdateReviewRequest
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;
    }
}