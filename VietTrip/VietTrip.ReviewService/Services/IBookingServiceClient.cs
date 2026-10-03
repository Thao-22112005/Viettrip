namespace VietTrip.ReviewService.Services
{
    public interface IBookingServiceClient
    {
        Task<BookingReviewInfo?> GetBookingReviewInfoAsync(
            int bookingId);
    }

    public class BookingReviewInfo
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int TourId { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}