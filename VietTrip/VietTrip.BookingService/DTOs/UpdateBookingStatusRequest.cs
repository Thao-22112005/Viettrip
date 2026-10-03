using System.ComponentModel.DataAnnotations;

namespace VietTrip.BookingService.DTOs
{
    public class UpdateBookingStatusRequest
    {
        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = string.Empty;
    }
}