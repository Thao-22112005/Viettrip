using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.MediaService.Data;
using VietTrip.MediaService.Models;
using VietTrip.MediaService.Services;

namespace VietTrip.MediaService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly ICloudinaryService _cloudinaryService;
        private readonly MediaDbContext _context;

        public MediaController(
            ICloudinaryService cloudinaryService,
            MediaDbContext context)
        {
            _cloudinaryService = cloudinaryService;
            _context = context;
        }

        // GET: api/media
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var media = await _context.Media
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(media);
        }

        // GET: api/media/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var media = await _context.Media
                .FirstOrDefaultAsync(x => x.Id == id);

            if (media == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy media."
                });
            }

            return Ok(media);
        }

        // POST: api/media/upload
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(
            IFormFile file,
            [FromQuery] string folder = "viettrip")
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Vui lòng chọn file ảnh."
                });
            }

            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            var extension =
                Path.GetExtension(file.FileName)
                    .ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message = "Chỉ hỗ trợ JPG, JPEG, PNG và WEBP."
                });
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new
                {
                    message = "Ảnh không được vượt quá 5 MB."
                });
            }

            try
            {
                var result =
                    await _cloudinaryService.UploadImageAsync(
                        file,
                        folder
                    );

                var media = new Media
                {
                    FileName = file.FileName,
                    PublicId = result.PublicId,
                    Url = result.Url,
                    Folder = folder,
                    FileSize = file.Length,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Media.Add(media);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Upload ảnh thành công.",
                    id = media.Id,
                    fileName = media.FileName,
                    publicId = media.PublicId,
                    url = media.Url,
                    folder = media.Folder,
                    fileSize = media.FileSize,
                    createdAt = media.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Upload ảnh thất bại.",
                    error = ex.Message
                });
            }
        }

        // DELETE: api/media?publicId=...
        [HttpDelete]
        public async Task<IActionResult> Delete(
            [FromQuery] string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                return BadRequest(new
                {
                    message = "PublicId không được để trống."
                });
            }

            var media = await _context.Media
                .FirstOrDefaultAsync(x => x.PublicId == publicId);

            if (media == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy media trong database."
                });
            }

            try
            {
                await _cloudinaryService
                    .DeleteImageAsync(publicId);

                _context.Media.Remove(media);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Đã xóa ảnh.",
                    id = media.Id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Xóa ảnh thất bại.",
                    error = ex.Message
                });
            }
        }
    }
}