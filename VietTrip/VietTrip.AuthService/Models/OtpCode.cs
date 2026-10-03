namespace VietTrip.AuthService.Models
{
    public class OtpCode
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Purpose { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}