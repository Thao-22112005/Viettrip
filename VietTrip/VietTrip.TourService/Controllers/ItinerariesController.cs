using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.TourService.Data;
using VietTrip.TourService.DTOs;
using VietTrip.TourService.Models;

namespace VietTrip.TourService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItinerariesController : ControllerBase
    {
        private readonly TourDbContext _context;

        public ItinerariesController(TourDbContext context)
        {
            _context = context;
        }

        // GET: api/itineraries
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var itineraries = await _context.Itineraries
                .OrderBy(i => i.TourId)
                .ThenBy(i => i.DayNumber)
                .ToListAsync();

            return Ok(itineraries);
        }

        // GET: api/itineraries/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var itinerary = await _context.Itineraries
                .FirstOrDefaultAsync(i => i.Id == id);

            if (itinerary == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch trình."
                });
            }

            return Ok(itinerary);
        }

        // GET: api/itineraries/tour/1
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

            var itineraries = await _context.Itineraries
                .Where(i => i.TourId == tourId)
                .OrderBy(i => i.DayNumber)
                .ToListAsync();

            return Ok(itineraries);
        }

        // POST: api/itineraries
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateItineraryRequest request)
        {
            // 1. Kiểm tra Tour
            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == request.TourId);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            // 2. Không cho thêm itinerary vào tour đã vô hiệu hóa
            if (!tour.IsActive)
            {
                return BadRequest(new
                {
                    message = "Tour đã bị vô hiệu hóa, không thể thêm lịch trình."
                });
            }

            // 3. Kiểm tra DayNumber không vượt quá số ngày của tour
            if (request.DayNumber > tour.DurationDays)
            {
                return BadRequest(new
                {
                    message = $"DayNumber không được lớn hơn số ngày của tour ({tour.DurationDays} ngày)."
                });
            }

            // 4. Kiểm tra trùng DayNumber
            var duplicateDay = await _context.Itineraries
                .AnyAsync(i =>
                    i.TourId == request.TourId &&
                    i.DayNumber == request.DayNumber);

            if (duplicateDay)
            {
                return Conflict(new
                {
                    message = $"Tour đã có lịch trình cho ngày {request.DayNumber}."
                });
            }

            // 5. Tạo itinerary
            var itinerary = new Itinerary
            {
                TourId = request.TourId,
                DayNumber = request.DayNumber,
                Title = request.Title,
                Description = request.Description
            };

            _context.Itineraries.Add(itinerary);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = itinerary.Id },
                itinerary
            );
        }

        // PUT: api/itineraries/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateItineraryRequest request)
        {
            // 1. Tìm itinerary
            var itinerary = await _context.Itineraries
                .FirstOrDefaultAsync(i => i.Id == id);

            if (itinerary == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch trình."
                });
            }

            // 2. Kiểm tra Tour
            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == itinerary.TourId);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            // 3. Không cho cập nhật nếu Tour đã vô hiệu hóa
            if (!tour.IsActive)
            {
                return BadRequest(new
                {
                    message = "Tour đã bị vô hiệu hóa, không thể cập nhật lịch trình."
                });
            }

            // 4. Kiểm tra DayNumber
            if (request.DayNumber > tour.DurationDays)
            {
                return BadRequest(new
                {
                    message = $"DayNumber không được lớn hơn số ngày của tour ({tour.DurationDays} ngày)."
                });
            }

            // 5. Kiểm tra trùng DayNumber với itinerary khác
            var duplicateDay = await _context.Itineraries
                .AnyAsync(i =>
                    i.Id != id &&
                    i.TourId == itinerary.TourId &&
                    i.DayNumber == request.DayNumber);

            if (duplicateDay)
            {
                return Conflict(new
                {
                    message = $"Tour đã có lịch trình cho ngày {request.DayNumber}."
                });
            }

            // 6. Cập nhật
            itinerary.DayNumber = request.DayNumber;
            itinerary.Title = request.Title;
            itinerary.Description = request.Description;

            await _context.SaveChangesAsync();

            return Ok(itinerary);
        }

        // DELETE: api/itineraries/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var itinerary = await _context.Itineraries
                .FirstOrDefaultAsync(i => i.Id == id);

            if (itinerary == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch trình."
                });
            }

            _context.Itineraries.Remove(itinerary);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã xóa lịch trình."
            });
        }
    }
}