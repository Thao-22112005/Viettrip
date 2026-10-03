using System.ComponentModel.DataAnnotations;

namespace VietTrip.PaymentService.DTOs
{
    public class UpdatePaymentStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? TransactionId { get; set; }
    }
}