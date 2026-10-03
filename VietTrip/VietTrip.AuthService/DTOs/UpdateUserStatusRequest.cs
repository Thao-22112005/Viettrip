using System.ComponentModel.DataAnnotations;

namespace VietTrip.AuthService.DTOs
{
    public class UpdateUserStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}