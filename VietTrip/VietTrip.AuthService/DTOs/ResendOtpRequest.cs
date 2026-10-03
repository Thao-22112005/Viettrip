using System.ComponentModel.DataAnnotations;

namespace VietTrip.AuthService.DTOs
{
    public class ResendOtpRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}