using System.Net.Http.Json;
using VietTrip.BookingService.DTOs;

namespace VietTrip.BookingService.Services
{
    public class TourServiceClient : ITourServiceClient
    {
        private readonly HttpClient _httpClient;

        public TourServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<TourBookingInfo?>
            GetTourBookingInfoAsync(
                int tourId,
                int scheduleId)
        {
            var response =
                await _httpClient.GetAsync(
                    $"api/Tours/{tourId}/booking-info/{scheduleId}"
                );

            if (response.StatusCode ==
                System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content
                        .ReadAsStringAsync();

                throw new HttpRequestException(
                    $"Tour Service request failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Response: {error}"
                );
            }

            return await response.Content
                .ReadFromJsonAsync<TourBookingInfo>();
        }

        public async Task<bool>
            DecreaseAvailableSlotsAsync(
                int scheduleId,
                int numberOfPeople)
        {
            var response =
                await _httpClient.PutAsync(
                    $"api/TourSchedules/{scheduleId}/decrease-slots" +
                    $"?numberOfPeople={numberOfPeople}",
                    null
                );

            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            if (response.StatusCode ==
                System.Net.HttpStatusCode.Conflict)
            {
                return false;
            }

            var error =
                await response.Content
                    .ReadAsStringAsync();

            throw new HttpRequestException(
                $"Cannot decrease available slots. " +
                $"Status: {(int)response.StatusCode}. " +
                $"Response: {error}"
            );
        }
        public async Task<bool> IncreaseAvailableSlotsAsync(int scheduleId,int numberOfPeople)
        {
            var response =
                await _httpClient.PutAsync(
                    $"api/TourSchedules/{scheduleId}/increase-slots" +
                    $"?numberOfPeople={numberOfPeople}",
                    null
                );

            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            var error =
                await response.Content.ReadAsStringAsync();

            throw new HttpRequestException(
                $"Cannot increase available slots. " +
                $"Status: {(int)response.StatusCode}. " +
                $"Response: {error}"
            );
        }
    }
}