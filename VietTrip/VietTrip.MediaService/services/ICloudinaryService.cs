using Microsoft.AspNetCore.Http;

namespace VietTrip.MediaService.Services
{
    public interface ICloudinaryService
    {
        Task<(string Url, string PublicId)> UploadImageAsync(
            IFormFile file,
            string folder);

        Task DeleteImageAsync(string publicId);
    }
}