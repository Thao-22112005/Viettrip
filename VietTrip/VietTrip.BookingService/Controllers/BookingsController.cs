using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.BookingService.Data;
using VietTrip.BookingService.DTOs;
using VietTrip.BookingService.Models;
using VietTrip.BookingService.Services;

namespace VietTrip.BookingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingDbContext _context;
        private readonly ITourServiceClient _tourServiceClient;
        private readonly IRabbitMqPublisher _rabbitMqPublisher;

        public BookingsController(
            BookingDbContext context,
            ITourServiceClient tourServiceClient,
            IRabbitMqPublisher rabbitMqPublisher)
        {
            _context = context;
            _tourServiceClient = tourServiceClient;
            _rabbitMqPublisher = rabbitMqPublisher;
        }

        // GET: api/bookings
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _context.Bookings
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/bookings/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy booking."
                });
            }

            return Ok(new
            {
                id = booking.Id,
                userId = booking.UserId,
                tourId = booking.TourId,
                tourScheduleId = booking.TourScheduleId,
                numberOfPeople = booking.NumberOfPeople,
                unitPrice = booking.UnitPrice,
                totalAmount = booking.TotalAmount,
                status = booking.Status,
                customerName = booking.CustomerName,
                customerEmail = booking.CustomerEmail,
                createdAt = booking.CreatedAt
            });
        }

        // GET: api/bookings/user/1
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/bookings/tour/1
        [HttpGet("tour/{tourId}")]
        public async Task<IActionResult> GetByTourId(int tourId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.TourId == tourId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bookings);
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<IActionResult> Create(CreateBookingRequest request)
        {
            if (request.NumberOfPeople <= 0)
            {
                return BadRequest(new
                {
                    message = "Số lượng người phải lớn hơn 0."
                });
            }

            TourBookingInfo? tourInfo;

            try
            {
                tourInfo =
                    await _tourServiceClient
                        .GetTourBookingInfoAsync(
                            request.TourId,
                            request.TourScheduleId
                        );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        message =
                            "Không thể kết nối Tour Service.",
                        error = ex.Message
                    }
                );
            }

            if (tourInfo == null)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy tour hoặc lịch khởi hành."
                });
            }

            if (!tourInfo.TourIsActive)
            {
                return BadRequest(new
                {
                    message =
                        "Tour đã bị vô hiệu hóa."
                });
            }

            if (!tourInfo.ScheduleIsActive)
            {
                return BadRequest(new
                {
                    message =
                        "Lịch khởi hành đã bị vô hiệu hóa."
                });
            }

            if (tourInfo.AvailableSlots <
                request.NumberOfPeople)
            {
                return Conflict(new
                {
                    message =
                        "Không đủ chỗ trống.",
                    availableSlots =
                        tourInfo.AvailableSlots
                });
            }

            var decreaseSuccess =
                await _tourServiceClient
                    .DecreaseAvailableSlotsAsync(
                        request.TourScheduleId,
                        request.NumberOfPeople
                    );

            if (!decreaseSuccess)
            {
                return Conflict(new
                {
                    message =
                        "Không đủ chỗ trống. " +
                        "Vui lòng thử lại."
                });
            }

            var totalAmount =
                tourInfo.Price *
                request.NumberOfPeople;

            var booking = new Booking
            {
                BookingCode = GenerateBookingCode(),

                UserId = request.UserId,
                TourId = request.TourId,
                TourScheduleId = request.TourScheduleId,

                NumberOfPeople =
                    request.NumberOfPeople,

                UnitPrice = tourInfo.Price,
                TotalAmount = totalAmount,

                Status = "Pending",

                CustomerName =
                    request.CustomerName,

                CustomerEmail =
                    request.CustomerEmail,

                CustomerPhone =
                    request.CustomerPhone,

                Note = request.Note,

                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _context.Bookings.Add(booking);

                await _context.SaveChangesAsync();
                await _rabbitMqPublisher.PublishNotificationAsync(
                    booking.CustomerEmail,
                    "VietTrip - Đặt tour thành công",
                    $"""
                    <h2>Đặt tour thành công!</h2>

                    <p>Xin chào <strong>{booking.CustomerName}</strong>,</p>

                    <p>VietTrip đã ghi nhận booking của bạn.</p>

                    <p>
                        <strong>Mã booking:</strong> {booking.BookingCode}
                    </p>

                    <p>
                        <strong>Số người:</strong> {booking.NumberOfPeople}
                    </p>

                    <p>
                        <strong>Tổng tiền:</strong> {booking.TotalAmount:N0} VNĐ
                    </p>

                    <p>
                        Trạng thái hiện tại:
                        <strong>{booking.Status}</strong>
                    </p>

                    <p>Cảm ơn bạn đã sử dụng VietTrip!</p>
                    """
                );

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = booking.Id },
                    booking
                );
            }
            catch
            {
                // Nếu tạo Booking thất bại sau khi
                // đã trừ chỗ thì cần cơ chế hoàn lại chỗ.
                // Phần compensation sẽ hoàn thiện
                // cùng RabbitMQ ở bước sau.

                throw;
            }
        }

        // PUT: api/bookings/1/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            UpdateBookingStatusRequest request)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy booking."
                });
            }

            var allowedStatuses = new[]
            {
                "Pending",
                "Confirmed",
                "Paid",
                "Cancelled",
                "Completed",
            };

            if (!allowedStatuses.Contains(
                    request.Status,
                    StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Trạng thái booking không hợp lệ.",
                    allowedStatuses
                });
            }

            booking.Status = request.Status;
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(booking);
        }

        // PUT: api/bookings/1/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy booking."
                });
            }

            if (booking.Status == "Cancelled")
            {
                return BadRequest(new
                {
                    message = "Booking đã được hủy."
                });
            }

            if (booking.Status == "Completed")
            {
                return BadRequest(new
                {
                    message =
                        "Không thể hủy booking đã hoàn thành."
                });
            }

            try
            {
                var increaseSuccess =
                    await _tourServiceClient
                        .IncreaseAvailableSlotsAsync(
                            booking.TourScheduleId,
                            booking.NumberOfPeople
                        );

                if (!increaseSuccess)
                {
                    return StatusCode(
                        StatusCodes.Status503ServiceUnavailable,
                        new
                        {
                            message =
                                "Không thể hoàn lại số chỗ."
                        }
                    );
                }

                booking.Status = "Cancelled";
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Đã hủy booking và hoàn lại số chỗ.",
                    booking
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        message =
                            "Không thể hủy booking.",
                        error = ex.Message
                    }
                );
            }
        }

        private static string GenerateBookingCode()
        {
            return $"VT{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        }
    }
}