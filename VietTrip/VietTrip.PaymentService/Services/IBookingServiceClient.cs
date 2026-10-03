using VietTrip.PaymentService.DTOs;

namespace VietTrip.PaymentService.Services
{
    public interface IBookingServiceClient
    {
        Task<BookingPaymentInfo?> GetBookingPaymentInfoAsync(int bookingId);

        Task<bool> UpdateBookingStatusAsync(
            int bookingId,
            string status);

        Task<bool> CancelBookingAsync(int bookingId);
    }
}