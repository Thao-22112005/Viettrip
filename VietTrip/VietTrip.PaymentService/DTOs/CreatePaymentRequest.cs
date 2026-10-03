using System.ComponentModel.DataAnnotations;

namespace VietTrip.PaymentService.DTOs
{
    public class CreatePaymentRequest
    {
        [Range(1, int.MaxValue)]
        public int BookingId { get; set; }

        [Required]
        [MaxLength(30)]
        public string PaymentMethod { get; set; } = string.Empty;
    }
}