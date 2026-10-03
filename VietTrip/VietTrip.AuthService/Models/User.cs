using System.ComponentModel.DataAnnotations;

namespace VietTrip.AuthService.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "User";

        public bool IsEmailVerified { get; set; } = false;

        public string Status { get; set; } = "Active";

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? AvatarUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<OtpCode> OtpCodes { get; set; } = new List<OtpCode>();
    }
}