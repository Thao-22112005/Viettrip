using System.ComponentModel.DataAnnotations;

namespace VietTrip.TourService.DTOs
{
    public class CreateTourImageRequest
    {
        [Range(1, int.MaxValue)]
        public int TourId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string PublicId { get; set; } = string.Empty;

        [Range(0, 1000)]
        public int DisplayOrder { get; set; } = 0;
    }
}