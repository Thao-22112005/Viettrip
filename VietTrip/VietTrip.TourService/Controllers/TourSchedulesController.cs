using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.TourService.Data;
using VietTrip.TourService.DTOs;
using VietTrip.TourService.Models;

namespace VietTrip.TourService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TourSchedulesController : ControllerBase
    {
        private readonly TourDbContext _context;

        public TourSchedulesController(TourDbContext context)
        {
            _context = context;
        }

        // GET: api/tourschedules
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var schedules = await _context.TourSchedules
                .OrderBy(s => s.StartDate)
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/tourschedules/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var schedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s => s.Id == id);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch khởi hành."
                });
            }

            return Ok(schedule);
        }

        // GET: api/tourschedules/tour/1
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

            var schedules = await _context.TourSchedules
                .Where(s => s.TourId == tourId)
                .OrderBy(s => s.StartDate)
                .ToListAsync();

            return Ok(schedules);
        }

        // POST: api/tourschedules
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateTourScheduleRequest request)
        {
            // 1. Kiểm tra ngày
            if (request.StartDate >= request.EndDate)
            {
                return BadRequest(new
                {
                    message = "Ngày kết thúc phải sau ngày bắt đầu."
                });
            }

            // 2. Kiểm tra Tour có tồn tại không
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
                    message = "Tour đã bị vô hiệu hóa, không thể thêm lịch khởi hành."
                });
            }

            // 3. Kiểm tra có lịch ACTIVE nào bị trùng thời gian không
            var overlap = await _context.TourSchedules
                .AnyAsync(s =>
                    s.TourId == request.TourId &&
                    s.IsActive &&
                    request.StartDate < s.EndDate &&
                    request.EndDate > s.StartDate);

            if (overlap)
            {
                return Conflict(new
                {
                    message = "Lịch khởi hành bị trùng thời gian."
                });
            }

            // 4. Kiểm tra có lịch INACTIVE nào giống hoàn toàn không
            var inactiveSchedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s =>
                    s.TourId == request.TourId &&
                    !s.IsActive &&
                    s.StartDate == request.StartDate &&
                    s.EndDate == request.EndDate);

            // 5. Nếu có -> khôi phục lịch cũ
            if (inactiveSchedule != null)
            {
                inactiveSchedule.AvailableSlots = request.AvailableSlots;
                inactiveSchedule.IsActive = true;
                inactiveSchedule.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(inactiveSchedule);
            }

            // 6. Nếu không có -> tạo lịch mới
            var schedule = new TourSchedule
            {
                TourId = request.TourId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                AvailableSlots = request.AvailableSlots,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.TourSchedules.Add(schedule);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = schedule.Id },
                schedule
            );
        }

        // PUT: api/tourschedules/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateTourScheduleRequest request)
        {
            var schedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s => s.Id == id);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch khởi hành."
                });
            }

            if (request.StartDate >= request.EndDate)
            {
                return BadRequest(new
                {
                    message = "Ngày kết thúc phải sau ngày bắt đầu."
                });
            }

            var overlap = await _context.TourSchedules
                .AnyAsync(s =>
                    s.Id != id &&
                    s.TourId == schedule.TourId &&
                    s.IsActive &&
                    request.StartDate < s.EndDate &&
                    request.EndDate > s.StartDate);

            if (overlap)
            {
                return Conflict(new
                {
                    message = "Lịch khởi hành bị trùng thời gian."
                });
            }

            schedule.StartDate = request.StartDate;
            schedule.EndDate = request.EndDate;
            schedule.AvailableSlots = request.AvailableSlots;
            schedule.IsActive = request.IsActive;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(schedule);
        }

        // DELETE: api/tourschedules/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var schedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s => s.Id == id);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch khởi hành."
                });
            }

            schedule.IsActive = false;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã vô hiệu hóa lịch khởi hành."
            });
        }

        [HttpPut("{id}/decrease-slots")]
        public async Task<IActionResult> DecreaseSlots(int id,[FromQuery] int numberOfPeople)
        {
            if (numberOfPeople <= 0)
            {
                return BadRequest(new
                {
                    message = "Số lượng người phải lớn hơn 0."
                });
            }

            var schedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s => s.Id == id);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch khởi hành."
                });
            }

            if (!schedule.IsActive)
            {
                return BadRequest(new
                {
                    message = "Lịch khởi hành đã bị vô hiệu hóa."
                });
            }

            if (schedule.AvailableSlots < numberOfPeople)
            {
                return Conflict(new
                {
                    message = "Không đủ chỗ trống.",
                    availableSlots = schedule.AvailableSlots
                });
            }

            schedule.AvailableSlots -= numberOfPeople;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã cập nhật số chỗ.",
                scheduleId = schedule.Id,
                availableSlots = schedule.AvailableSlots
            });
        }


        [HttpPut("{id}/increase-slots")]
        public async Task<IActionResult> IncreaseSlots(int id,[FromQuery] int numberOfPeople)
        {
            if (numberOfPeople <= 0)
            {
                return BadRequest(new
                {
                    message = "Số lượng người phải lớn hơn 0."
                });
            }

            var schedule = await _context.TourSchedules
                .FirstOrDefaultAsync(s => s.Id == id);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy lịch khởi hành."
                });
            }

            schedule.AvailableSlots += numberOfPeople;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã hoàn lại số chỗ.",
                scheduleId = schedule.Id,
                availableSlots = schedule.AvailableSlots
            });
        }
    }
}