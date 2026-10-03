using System.Net.Http.Json;

namespace VietTrip.ReviewService.Services
{
    public class BookingServiceClient : IBookingServiceClient
    {
        private readonly HttpClient _httpClient;

        public BookingServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<BookingReviewInfo?>
            GetBookingReviewInfoAsync(int bookingId)
        {
            var response = await _httpClient.GetAsync(
                $"api/Bookings/{bookingId}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content
                .ReadFromJsonAsync<BookingReviewInfo>();
        }
    }
}