using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.DestinationService.Data;
using VietTrip.DestinationService.DTOs;
using VietTrip.DestinationService.Models;

namespace VietTrip.DestinationService.Controllers
{
    [ApiController]
    [Route("api/Destinations/{destinationId:int}/highlights")]
    public class DestinationHighlightsController : ControllerBase
    {
        private readonly DestinationDbContext _context;

        public DestinationHighlightsController(
            DestinationDbContext context)
        {
            _context = context;
        }

        // GET
        // api/Destinations/1/highlights
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int destinationId)
        {
            var destinationExists =
                await _context.Destinations
                    .AnyAsync(d =>
                        d.Id == destinationId);

            if (!destinationExists)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy địa điểm."
                });
            }

            var highlights =
                await _context.DestinationHighlights
                    .Where(h =>
                        h.DestinationId ==
                        destinationId &&
                        h.IsActive)
                    .OrderBy(h => h.SortOrder)
                    .ThenBy(h => h.Id)
                    .ToListAsync();

            return Ok(highlights);
        }

        // GET
        // api/Destinations/1/highlights/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int destinationId,
            int id)
        {
            var highlight =
                await _context.DestinationHighlights
                    .FirstOrDefaultAsync(h =>
                        h.Id == id &&
                        h.DestinationId ==
                        destinationId);

            if (highlight == null)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy điểm nổi bật."
                });
            }

            return Ok(highlight);
        }

        // POST
        // api/Destinations/1/highlights
        [HttpPost]
        public async Task<IActionResult> Create(
            int destinationId,
            CreateDestinationHighlightRequest request)
        {
            var destinationExists =
                await _context.Destinations
                    .AnyAsync(d =>
                        d.Id == destinationId);

            if (!destinationExists)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy địa điểm."
                });
            }

            if (string.IsNullOrWhiteSpace(
                request.Title))
            {
                return BadRequest(new
                {
                    message =
                        "Tiêu đề không được để trống."
                });
            }

            var highlight =
                new DestinationHighlight
                {
                    DestinationId =
                        destinationId,

                    Title =
                        request.Title.Trim(),

                    Description =
                        request.Description?.Trim(),

                    Icon =
                        request.Icon?.Trim(),

                    SortOrder =
                        request.SortOrder,

                    IsActive = true,

                    CreatedAt =
                        DateTime.UtcNow
                };

            _context.DestinationHighlights.Add(
                highlight);

            await _context.SaveChangesAsync();

            return Ok(highlight);
        }

        // PUT
        // api/Destinations/1/highlights/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int destinationId,
            int id,
            UpdateDestinationHighlightRequest request)
        {
            var highlight =
                await _context.DestinationHighlights
                    .FirstOrDefaultAsync(h =>
                        h.Id == id &&
                        h.DestinationId ==
                        destinationId);

            if (highlight == null)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy điểm nổi bật."
                });
            }

            if (string.IsNullOrWhiteSpace(
                request.Title))
            {
                return BadRequest(new
                {
                    message =
                        "Tiêu đề không được để trống."
                });
            }

            highlight.Title =
                request.Title.Trim();

            highlight.Description =
                request.Description?.Trim();

            highlight.Icon =
                request.Icon?.Trim();

            highlight.SortOrder =
                request.SortOrder;

            highlight.IsActive =
                request.IsActive;

            highlight.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(highlight);
        }

        // DELETE
        // api/Destinations/1/highlights/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int destinationId,
            int id)
        {
            var highlight =
                await _context.DestinationHighlights
                    .FirstOrDefaultAsync(h =>
                        h.Id == id &&
                        h.DestinationId ==
                        destinationId);

            if (highlight == null)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy điểm nổi bật."
                });
            }

            highlight.IsActive = false;

            highlight.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Đã vô hiệu hóa điểm nổi bật."
            });
        }
    }
}