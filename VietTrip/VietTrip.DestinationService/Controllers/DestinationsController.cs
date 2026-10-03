using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using VietTrip.DestinationService.Data;
using VietTrip.DestinationService.DTOs;
using VietTrip.DestinationService.Models;

namespace VietTrip.DestinationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DestinationsController : ControllerBase
    {
        private readonly DestinationDbContext _context;

        public DestinationsController(
            DestinationDbContext context)
        {
            _context = context;
        }

        // GET: api/Destinations
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var destinations = await _context.Destinations
                .OrderBy(d => d.SortOrder)
                .ThenBy(d => d.Id)
                .ToListAsync();

            return Ok(destinations);
        }

        // GET: api/Destinations/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var destination = await _context.Destinations
                .Include(d => d.Highlights
                    .Where(h => h.IsActive)
                    .OrderBy(h => h.SortOrder))
                .FirstOrDefaultAsync(d => d.Id == id);

            if (destination == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy địa điểm."
                });
            }

            return Ok(destination);
        }

        // GET: api/Destinations/slug/ha-noi
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var destination = await _context.Destinations
                .Include(d => d.Highlights
                    .Where(h => h.IsActive)
                    .OrderBy(h => h.SortOrder))
                .FirstOrDefaultAsync(
                    d => d.Slug == slug);

            if (destination == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy địa điểm."
                });
            }

            return Ok(destination);
        }

        // POST: api/Destinations
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateDestinationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new
                {
                    message = "Tên địa điểm không được để trống."
                });
            }

            var name = request.Name.Trim();

            var slug = string.IsNullOrWhiteSpace(request.Slug)
                ? GenerateSlug(name)
                : GenerateSlug(request.Slug);

            var exists = await _context.Destinations
                .AnyAsync(d =>
                    d.Name.ToLower() == name.ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Địa điểm đã tồn tại."
                });
            }

            var slugExists = await _context.Destinations
                .AnyAsync(d => d.Slug == slug);

            if (slugExists)
            {
                slug = $"{slug}-{Guid.NewGuid()
                    .ToString("N")[..6]}";
            }

            var destination = new Destination
            {
                Name = name,
                Slug = slug,

                Province = request.Province?.Trim(),

                Region = request.Region?.Trim(),

                Country =
                    string.IsNullOrWhiteSpace(request.Country)
                        ? "Vietnam"
                        : request.Country.Trim(),

                ShortDescription =
                    request.ShortDescription?.Trim(),

                Description =
                    request.Description?.Trim(),

                ImageUrl =
                    request.ImageUrl?.Trim(),

                Latitude = request.Latitude,

                Longitude = request.Longitude,

                IsActive = true,

                SortOrder = request.SortOrder,

                CreatedAt = DateTime.UtcNow
            };

            _context.Destinations.Add(destination);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = destination.Id },
                destination
            );
        }

        // PUT: api/Destinations/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateDestinationRequest request)
        {
            var destination =
                await _context.Destinations
                    .FirstOrDefaultAsync(
                        d => d.Id == id);

            if (destination == null)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy địa điểm."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new
                {
                    message =
                        "Tên địa điểm không được để trống."
                });
            }

            var name = request.Name.Trim();

            var duplicateName =
                await _context.Destinations
                    .AnyAsync(d =>
                        d.Id != id &&
                        d.Name.ToLower() ==
                        name.ToLower());

            if (duplicateName)
            {
                return Conflict(new
                {
                    message =
                        "Tên địa điểm đã tồn tại."
                });
            }

            var slug = string.IsNullOrWhiteSpace(
                request.Slug)
                ? GenerateSlug(name)
                : GenerateSlug(request.Slug);

            var duplicateSlug =
                await _context.Destinations
                    .AnyAsync(d =>
                        d.Id != id &&
                        d.Slug == slug);

            if (duplicateSlug)
            {
                return Conflict(new
                {
                    message =
                        "Slug địa điểm đã tồn tại."
                });
            }

            destination.Name = name;

            destination.Slug = slug;

            destination.Province =
                request.Province?.Trim();

            destination.Region =
                request.Region?.Trim();

            destination.Country =
                string.IsNullOrWhiteSpace(
                    request.Country)
                    ? "Vietnam"
                    : request.Country.Trim();

            destination.ShortDescription =
                request.ShortDescription?.Trim();

            destination.Description =
                request.Description?.Trim();

            destination.ImageUrl =
                request.ImageUrl?.Trim();

            destination.Latitude =
                request.Latitude;

            destination.Longitude =
                request.Longitude;

            destination.SortOrder =
                request.SortOrder;

            destination.IsActive =
                request.IsActive;

            destination.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(destination);
        }

        // DELETE: api/Destinations/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int id)
        {
            var destination =
                await _context.Destinations
                    .FirstOrDefaultAsync(
                        d => d.Id == id);

            if (destination == null)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy địa điểm."
                });
            }

            destination.IsActive = false;

            destination.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Đã vô hiệu hóa địa điểm."
            });
        }

        private static string GenerateSlug(
            string text)
        {
            text = text.Trim().ToLowerInvariant();

            text = text.Normalize(
                NormalizationForm.FormD);

            var builder = new StringBuilder();

            foreach (var character in text)
            {
                var category =
                    CharUnicodeInfo.GetUnicodeCategory(
                        character);

                if (category ==
                    UnicodeCategory.NonSpacingMark)
                {
                    continue;
                }

                builder.Append(character);
            }

            var slug = builder
                .ToString()
                .Normalize(
                    NormalizationForm.FormC);

            slug = slug
                .Replace('đ', 'd')
                .Replace('Đ', 'd');

            var result = new StringBuilder();

            foreach (var character in slug)
            {
                if (char.IsLetterOrDigit(character))
                {
                    result.Append(character);
                }
                else if (
                    character == ' ' ||
                    character == '-' ||
                    character == '_')
                {
                    result.Append('-');
                }
            }

            return result
                .ToString()
                .Trim('-');
        }
    }
}