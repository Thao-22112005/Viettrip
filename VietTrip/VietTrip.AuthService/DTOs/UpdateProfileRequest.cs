namespace VietTrip.AuthService.DTOs
{
    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? AvatarUrl { get; set; }
    }
}