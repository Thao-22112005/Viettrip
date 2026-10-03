using VietTrip.BookingService.DTOs;

namespace VietTrip.BookingService.Services
{
    public interface ITourServiceClient
    {
        Task<TourBookingInfo?> GetTourBookingInfoAsync(
            int tourId,
            int scheduleId);

        Task<bool> DecreaseAvailableSlotsAsync(
            int scheduleId,
            int numberOfPeople);

        Task<bool> IncreaseAvailableSlotsAsync(
            int scheduleId,
            int numberOfPeople);
    }
}