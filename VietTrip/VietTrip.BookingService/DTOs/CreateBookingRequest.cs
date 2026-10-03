using System.ComponentModel.DataAnnotations;

namespace VietTrip.BookingService.DTOs
{
    public class CreateBookingRequest
    {
        [Range(1, int.MaxValue)]
        public int UserId { get; set; }

        [Range(1, int.MaxValue)]
        public int TourId { get; set; }

        [Range(1, int.MaxValue)]
        public int TourScheduleId { get; set; }

        [Range(1, 100)]
        public int NumberOfPeople { get; set; }

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string CustomerPhone { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Note { get; set; }
    }
}