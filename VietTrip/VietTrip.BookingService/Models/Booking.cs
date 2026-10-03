using System.ComponentModel.DataAnnotations;

namespace VietTrip.BookingService.Models
{
    public class Booking
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string BookingCode { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }

        [Required]
        public int TourId { get; set; }

        [Required]
        public int TourScheduleId { get; set; }

        [Range(1, 100)]
        public int NumberOfPeople { get; set; }

        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending";

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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}