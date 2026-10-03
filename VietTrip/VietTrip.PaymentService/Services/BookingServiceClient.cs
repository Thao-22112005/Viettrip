using System.Net.Http.Json;
using VietTrip.PaymentService.DTOs;

namespace VietTrip.PaymentService.Services
{
    public class BookingServiceClient : IBookingServiceClient
    {
        private readonly HttpClient _httpClient;

        public BookingServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<BookingPaymentInfo?> GetBookingPaymentInfoAsync(int bookingId)
        {
            var response = await _httpClient.GetAsync(
                $"api/Bookings/{bookingId}"
            );

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content.ReadFromJsonAsync<BookingPaymentInfo>();
        }

        public async Task<bool> UpdateBookingStatusAsync(int bookingId, string status)
        {
            var response = await _httpClient.PutAsJsonAsync(
                $"api/Bookings/{bookingId}/status",
                new
                {
                    status
                });

            return response.IsSuccessStatusCode;
        }

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            var response = await _httpClient.PutAsync(
                $"api/Bookings/{bookingId}/cancel",
                null);

            return response.IsSuccessStatusCode;
        }
    }
}