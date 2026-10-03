using Microsoft.AspNetCore.Http;

namespace VietTrip.TourService.Services
{
    public interface IMediaServiceClient
    {
        Task<(string Url, string PublicId)> UploadImageAsync(
            IFormFile file,
            string folder);

        Task DeleteImageAsync(string publicId);
    }
}