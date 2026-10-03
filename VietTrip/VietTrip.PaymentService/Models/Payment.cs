using System.ComponentModel.DataAnnotations;

namespace VietTrip.PaymentService.Models
{
    public class Payment
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentCode { get; set; } = string.Empty;

        [Required]
        public int BookingId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(30)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Pending";

        [MaxLength(150)]
        public string? TransactionId { get; set; }

        public DateTime? PaidAt { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}