namespace VietTrip.TourService.DTOs
{
    public class TourBookingInfoResponse
    {
        public int TourId { get; set; }

        public string TourName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int DurationDays { get; set; }

        public int DurationNights { get; set; }

        public string? CoverImageUrl { get; set; }

        public bool TourIsActive { get; set; }

        public int ScheduleId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int AvailableSlots { get; set; }

        public bool ScheduleIsActive { get; set; }
    }
}