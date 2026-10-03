using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using VietTrip.TourService.DTOs;

namespace VietTrip.TourService.Services
{
    public class MediaServiceClient : IMediaServiceClient
    {
        private readonly HttpClient _httpClient;

        public MediaServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<(string Url, string PublicId)> UploadImageAsync(
            IFormFile file,
            string folder)
        {
            using var content = new MultipartFormDataContent();

            await using var stream = file.OpenReadStream();

            using var fileContent = new StreamContent(stream);

            fileContent.Headers.ContentType =
                new MediaTypeHeaderValue(
                    file.ContentType
                );

            content.Add(
                fileContent,
                "file",
                file.FileName
            );

            var url =
                $"api/Media/upload?folder={Uri.EscapeDataString(folder)}";

            var response = await _httpClient.PostAsync(
                url,
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content.ReadAsStringAsync();

                throw new HttpRequestException(
                    $"Media Service upload failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Response: {error}"
                );
            }

            var result =
                await response.Content
                    .ReadFromJsonAsync<MediaUploadResponse>();

            if (result == null ||
                string.IsNullOrWhiteSpace(result.Url) ||
                string.IsNullOrWhiteSpace(result.PublicId))
            {
                throw new InvalidOperationException(
                    "Media Service trả về dữ liệu upload không hợp lệ."
                );
            }

            return (
                result.Url,
                result.PublicId
            );
        }

        public async Task DeleteImageAsync(string publicId)
        {
            var url =
                $"api/Media?publicId={Uri.EscapeDataString(publicId)}";

            var response =
                await _httpClient.DeleteAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content.ReadAsStringAsync();

                throw new HttpRequestException(
                    $"Media Service delete failed. " +
                    $"Status: {(int)response.StatusCode}. " +
                    $"Response: {error}"
                );
            }
        }
    }
}