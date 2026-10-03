namespace VietTrip.ReviewService.DTOs
{
    public class TourReviewSummaryResponse
    {
        public int TourId { get; set; }

        public double AverageRating { get; set; }

        public int ReviewCount { get; set; }
    }
}