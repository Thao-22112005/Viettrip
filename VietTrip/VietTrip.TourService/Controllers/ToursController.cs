using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.TourService.Data;
using VietTrip.TourService.DTOs;
using VietTrip.TourService.Models;

namespace VietTrip.TourService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly TourDbContext _context;

        public ToursController(TourDbContext context)
        {
            _context = context;
        }

        // GET: api/tours
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tours = await _context.Tours
                .OrderBy(t => t.Id)
                .ToListAsync();

            return Ok(tours);
        }

        // GET: api/tours/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tour = await _context.Tours
                .Include(t => t.TourSchedules)
                .Include(t => t.Itineraries)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            return Ok(tour);
        }

        // POST: api/tours
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateTourRequest request)
        {
            var name = request.Name.Trim();

            var exists = await _context.Tours
                .AnyAsync(t =>
                    t.Name.ToLower() == name.ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Tên tour đã tồn tại."
                });
            }

            var tour = new Tour
            {
                Name = name,
                Description = request.Description?.Trim(),
                CategoryId = request.CategoryId,
                DestinationId = request.DestinationId,
                DurationDays = request.DurationDays,
                DurationNights = request.DurationNights,
                Price = request.Price,
                Departure = request.Departure,
                Transport = request.Transport,
                MaxPeople = request.MaxPeople,
                CoverImageUrl = request.CoverImageUrl?.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tours.Add(tour);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = tour.Id },
                tour
            );
        }

        // PUT: api/tours/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateTourRequest request)
        {
            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            var name = request.Name.Trim();

            var duplicate = await _context.Tours
                .AnyAsync(t =>
                    t.Id != id &&
                    t.Name.ToLower() == name.ToLower());

            if (duplicate)
            {
                return Conflict(new
                {
                    message = "Tên tour đã tồn tại."
                });
            }

            tour.Name = name;
            tour.Description = request.Description?.Trim();
            tour.CategoryId = request.CategoryId;
            tour.DestinationId = request.DestinationId;
            tour.DurationDays = request.DurationDays;
            tour.DurationNights = request.DurationNights;
            tour.Price = request.Price;
            tour.Transport = request.Transport;
            tour.Departure = request.Departure;
            tour.MaxPeople = request.MaxPeople;
            tour.CoverImageUrl = request.CoverImageUrl?.Trim();
            tour.IsActive = request.IsActive;
            tour.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(tour);
        }

        // DELETE: api/tours/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            // Soft delete
            tour.IsActive = false;
            tour.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã vô hiệu hóa tour."
            });
        }

        [HttpGet("{tourId}/booking-info/{scheduleId}")]
        public async Task<IActionResult> GetBookingInfo(int tourId,int scheduleId)
        {
            var tour = await _context.Tours
                .FirstOrDefaultAsync(t => t.Id == tourId);

            if (tour == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy tour."
                });
            }

            var schedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s =>
                    s.Id == scheduleId &&
                    s.TourId == tourId);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch khởi hành."
                });
            }

            return Ok(new TourBookingInfoResponse
            {
                TourId = tour.Id,
                TourName = tour.Name,
                Price = tour.Price,

                DurationDays = tour.DurationDays,
                DurationNights = tour.DurationNights,

                CoverImageUrl = tour.CoverImageUrl,

                TourIsActive = tour.IsActive,

                ScheduleId = schedule.Id,
                StartDate = schedule.StartDate,
                EndDate = schedule.EndDate,
                AvailableSlots = schedule.AvailableSlots,
                ScheduleIsActive = schedule.IsActive
            });
        }
    }
}