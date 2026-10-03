using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.TourService.Data;
using VietTrip.TourService.DTOs;
using VietTrip.TourService.Models;
using VietTrip.TourService.Services;

namespace VietTrip.TourService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TourImagesController : ControllerBase
    {
        private readonly TourDbContext _context;
        private readonly IMediaServiceClient _mediaServiceClient;

        public TourImagesController(
            TourDbContext context,
            IMediaServiceClient mediaServiceClient)
        {
            _context = context;
            _mediaServiceClient = mediaServiceClient;
        }

        // GET: api/TourImages
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var images = await _context.TourImages
                .OrderBy(i => i.TourId)
                .ThenBy(i => i.DisplayOrder)
                .ToListAsync();

            return Ok(images);
        }

        // GET: api/TourImages/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var image = await _context.TourImages
                .FirstOrDefaultAsync(i => i.Id == id);

            if (image == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy ảnh tour."
                });
            }

            return Ok(image);
        }

        // GET: api/TourImages/tour/1002
        [HttpGet("tour/{tourId}")]
        public async Task<IActionResult> GetByTourId(int tourId)
        {
            var tourExists = await _context.Tours
                .AnyAsync(t => t.Id == tourId);

            if (!tourExists)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            var images = await _context.TourImages
                .Where(i => i.TourId == tourId && i.IsActive)
                .OrderBy(i => i.DisplayOrder)
                .ThenBy(i => i.Id)
                .ToListAsync();

            return Ok(images);
        }

        // POST: api/TourImages
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateTourImageRequest request)
        {
            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == request.TourId);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            if (!tour.IsActive)
            {
                return BadRequest(new
                {
                    message = "Tour đã bị vô hiệu hóa, không thể thêm ảnh."
                });
            }

            // Kiểm tra PublicId đã tồn tại
            var publicIdExists = await _context.TourImages
                .AnyAsync(i => i.PublicId == request.PublicId);

            if (publicIdExists)
            {
                return Conflict(new
                {
                    message = "Ảnh này đã tồn tại trong hệ thống."
                });
            }

            var image = new TourImage
            {
                TourId = request.TourId,
                ImageUrl = request.ImageUrl,
                PublicId = request.PublicId,
                DisplayOrder = request.DisplayOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.TourImages.Add(image);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = image.Id },
                image
            );
        }

        // PUT: api/TourImages/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateTourImageRequest request)
        {
            var image = await _context.TourImages
                .FirstOrDefaultAsync(i => i.Id == id);

            if (image == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy ảnh tour."
                });
            }

            var duplicatePublicId = await _context.TourImages
                .AnyAsync(i =>
                    i.Id != id &&
                    i.PublicId == request.PublicId);

            if (duplicatePublicId)
            {
                return Conflict(new
                {
                    message = "PublicId của ảnh đã tồn tại."
                });
            }

            image.ImageUrl = request.ImageUrl;
            image.PublicId = request.PublicId;
            image.DisplayOrder = request.DisplayOrder;
            image.IsActive = request.IsActive;
            image.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(image);
        }

        // DELETE: api/TourImages/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var image = await _context.TourImages
                .FirstOrDefaultAsync(i => i.Id == id);

            if (image == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy ảnh tour."
                });
            }

            try
            {
                if (!string.IsNullOrWhiteSpace(image.PublicId))
                {
                    await _mediaServiceClient
                        .DeleteImageAsync(image.PublicId);
                }

                image.IsActive = false;
                image.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Đã xóa ảnh tour."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Không thể xóa ảnh tour.",
                        error = ex.Message
                    }
                );
            }
        }

        [HttpPost("upload/{tourId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload(
                                                int tourId,
                                                IFormFile file,
                                                [FromForm] int displayOrder = 0)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Vui lòng chọn ảnh."
                });
            }

            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == tourId);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            if (!tour.IsActive)
            {
                return BadRequest(new
                {
                    message =
                        "Tour đã bị vô hiệu hóa, không thể thêm ảnh."
                });
            }

            if (displayOrder < 0)
            {
                return BadRequest(new
                {
                    message = "DisplayOrder không hợp lệ."
                });
            }

            string uploadedPublicId = string.Empty;

            try
            {
                var result =
                    await _mediaServiceClient.UploadImageAsync(
                        file,
                        "viettrip/tours/gallery"
                    );

                uploadedPublicId = result.PublicId;

                var image = new TourImage
                {
                    TourId = tourId,
                    ImageUrl = result.Url,
                    PublicId = result.PublicId,
                    DisplayOrder = displayOrder,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TourImages.Add(image);

                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = image.Id },
                    image
                );
            }
            catch (Exception ex)
            {
                // Nếu Cloudinary upload thành công
                // nhưng lưu DB thất bại thì xóa ảnh khỏi Cloudinary
                if (!string.IsNullOrWhiteSpace(uploadedPublicId))
                {
                    try
                    {
                        await _mediaServiceClient
                            .DeleteImageAsync(uploadedPublicId);
                    }
                    catch
                    {
                        // Không che mất lỗi chính
                    }
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Không thể upload ảnh tour.",
                        error = ex.Message
                    }
                );
            }
        }
    }
}