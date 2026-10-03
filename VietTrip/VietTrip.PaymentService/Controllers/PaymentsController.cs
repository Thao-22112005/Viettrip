using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.PaymentService.Data;
using VietTrip.PaymentService.DTOs;
using VietTrip.PaymentService.Models;
using VietTrip.PaymentService.Services;

namespace VietTrip.PaymentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentDbContext _context;
        private readonly IBookingServiceClient _bookingServiceClient;
        private readonly IRabbitMqPublisher _rabbitMqPublisher;

        public PaymentsController(
            PaymentDbContext context,
            IBookingServiceClient bookingServiceClient,
            IRabbitMqPublisher rabbitMqPublisher)
        {
            _context = context;
            _bookingServiceClient = bookingServiceClient;
            _rabbitMqPublisher = rabbitMqPublisher;
        }

        // GET: api/Payments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _context.Payments
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/Payments/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy thanh toán."
                });
            }

            return Ok(payment);
        }

        // GET: api/Payments/booking/1
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetByBookingId(int bookingId)
        {
            var payments = await _context.Payments
                .Where(p => p.BookingId == bookingId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(payments);
        }

        // POST: api/Payments
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreatePaymentRequest request)
        {
            // 1. Kiểm tra booking
            var booking = await _bookingServiceClient
                .GetBookingPaymentInfoAsync(request.BookingId);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy booking."
                });
            }

            // 2. Kiểm tra trạng thái booking
            if (booking.Status == "Cancelled")
            {
                return BadRequest(new
                {
                    message = "Booking đã bị hủy, không thể thanh toán."
                });
            }

            if (booking.Status == "Completed")
            {
                return BadRequest(new
                {
                    message = "Booking đã hoàn thành."
                });
            }

            // 3. Kiểm tra booking đã thanh toán chưa
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p =>
                    p.BookingId == request.BookingId &&
                    p.Status == "Paid");

            if (existingPayment != null)
            {
                return Conflict(new
                {
                    message = "Booking này đã được thanh toán."
                });
            }

            // 4. Kiểm tra booking đang có payment Pending hay không
            var pendingPayment = await _context.Payments
                .FirstOrDefaultAsync(p =>
                    p.BookingId == request.BookingId &&
                    p.Status == "Pending");

            if (pendingPayment != null)
            {
                return Conflict(new
                {
                    message = "Booking này đang có một giao dịch thanh toán đang chờ xử lý.",
                    paymentId = pendingPayment.Id
                });
            }

            // 5. Kiểm tra phương thức thanh toán
            var allowedMethods = new[]
            {
                "Cash",
                "BankTransfer",
                "Online"
            };

            if (!allowedMethods.Contains(request.PaymentMethod))
            {
                return BadRequest(new
                {
                    message = "Phương thức thanh toán không hợp lệ."
                });
            }

            // 6. Tạo PaymentCode
            var paymentCode =
                $"PAY-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"
                .Substring(0, 30);

            // 7. Tạo payment
            var payment = new Payment
            {
                PaymentCode = paymentCode,
                BookingId = booking.Id,
                UserId = booking.UserId,
                Amount = booking.TotalAmount,
                PaymentMethod = request.PaymentMethod,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = payment.Id },
                payment
            );
        }

        // PUT: api/Payments/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdatePaymentStatusRequest request)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy thanh toán."
                });
            }

            var bookingPaymentInfo =
                await _bookingServiceClient.GetBookingPaymentInfoAsync(
                    payment.BookingId);

            if (bookingPaymentInfo == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy thông tin Booking."
                });
            }

            // 1. Các trạng thái được phép
            var allowedStatuses = new[]
            {
                "Pending",
                "Paid",
                "Failed",
                "RefundRequested",
                "Refunded"
            };

            if (!allowedStatuses.Contains(request.Status))
            {
                return BadRequest(new
                {
                    message = "Trạng thái thanh toán không hợp lệ."
                });
            }

            // 2. Nếu đã Refunded thì không được chuyển trạng thái nữa
            if (payment.Status == "Refunded")
            {
                return BadRequest(new
                {
                    message = "Thanh toán đã được hoàn tiền, không thể thay đổi trạng thái."
                });
            }

            // 3. Kiểm tra chuyển trạng thái hợp lệ
            bool validTransition = payment.Status switch
            {
                "Pending" =>
                    request.Status == "Paid" ||
                    request.Status == "Failed",

                "Failed" =>
                    request.Status == "Paid",

                "Paid" =>
                    request.Status == "RefundRequested",

                "RefundRequested" =>
                    request.Status == "Refunded",

                _ => false
            };

            if (!validTransition)
            {
                return BadRequest(new
                {
                    message =
                        $"Không thể chuyển trạng thái thanh toán từ {payment.Status} sang {request.Status}."
                });
            }

            // 4. Nếu chuyển sang Paid
            if (request.Status == "Paid")
            {
                var bookingUpdated =
                    await _bookingServiceClient.UpdateBookingStatusAsync(
                        payment.BookingId,
                        "Paid");

                if (!bookingUpdated)
                {
                    return BadRequest(new
                    {
                        message = "Không thể cập nhật trạng thái Booking."
                    });
                }

                payment.PaidAt = DateTime.UtcNow;
            }

            // 5. Nếu chuyển sang Refunded
            if (request.Status == "Refunded")
            {
                var bookingCancelled =
                    await _bookingServiceClient.CancelBookingAsync(
                        payment.BookingId);

                if (!bookingCancelled)
                {
                    return BadRequest(new
                    {
                        message = "Không thể hủy Booking để hoàn tiền."
                    });
                }
            }

            // 6. Cập nhật TransactionId nếu có
            if (!string.IsNullOrWhiteSpace(request.TransactionId))
            {
                payment.TransactionId = request.TransactionId;
            }

            // 7. Cập nhật trạng thái
            payment.Status = request.Status;
            payment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            switch (request.Status)
            {
                case "Paid":
                    await _rabbitMqPublisher.PublishNotificationAsync(
                        bookingPaymentInfo.CustomerEmail,
                        "VietTrip - Thanh toán thành công",
                        $"""
                        <h2>Thanh toán thành công!</h2>

                        <p>
                            Xin chào
                            <strong>{bookingPaymentInfo.CustomerName}</strong>,
                        </p>

                        <p>
                            VietTrip đã xác nhận thanh toán
                            cho booking của bạn.
                        </p>

                        <p>
                            <strong>Mã booking:</strong>
                            {bookingPaymentInfo.Id}
                        </p>

                        <p>
                            <strong>Số tiền:</strong>
                            {payment.Amount:N0} VNĐ
                        </p>

                        <p>
                            <strong>Phương thức:</strong>
                            {payment.PaymentMethod}
                        </p>

                        <p>Trạng thái: <strong>Đã thanh toán</strong></p>

                        <p>Cảm ơn bạn đã sử dụng VietTrip!</p>
                        """
                    );
                break;

                case "Failed":
                    await _rabbitMqPublisher.PublishNotificationAsync(
                        bookingPaymentInfo.CustomerEmail,
                        "VietTrip - Thanh toán thất bại",
                        $"""
                        <h2>Thanh toán thất bại</h2>

                        <p>
                            Xin chào
                            <strong>{bookingPaymentInfo.CustomerName}</strong>,
                        </p>

                        <p>
                            Thanh toán cho booking của bạn
                            chưa được thực hiện thành công.
                        </p>

                        <p>
                            <strong>Mã booking:</strong>
                            {bookingPaymentInfo.Id}
                        </p>

                        <p>
                            <strong>Số tiền:</strong>
                            {payment.Amount:N0} VNĐ
                        </p>

                        <p>Bạn có thể kiểm tra lại và thử thanh toán lại.</p>
                        """
                    );
                break;

                case "Refunded":
                    await _rabbitMqPublisher.PublishNotificationAsync(
                        bookingPaymentInfo.CustomerEmail,
                        "VietTrip - Hoàn tiền thành công",
                        $"""
                        <h2>Hoàn tiền thành công</h2>

                        <p>
                            Xin chào
                            <strong>{bookingPaymentInfo.CustomerName}</strong>,
                        </p>

                        <p>
                            VietTrip đã xử lý hoàn tiền
                            cho booking của bạn.
                        </p>

                        <p>
                            <strong>Mã booking:</strong>
                            {bookingPaymentInfo.Id}
                        </p>

                        <p>
                            <strong>Số tiền hoàn:</strong>
                            {payment.Amount:N0} VNĐ
                        </p>

                        <p>Trạng thái: <strong>Đã hoàn tiền</strong></p>
                        """
                    );
                break;
            }
                    return Ok(new
            {
                message = "Cập nhật trạng thái thanh toán thành công.",
                payment.Id,
                payment.PaymentCode,
                payment.BookingId,
                payment.Amount,
                payment.PaymentMethod,
                payment.Status,
                payment.TransactionId,
                payment.PaidAt,
                payment.UpdatedAt
            });
        }

        // PUT: api/Payments/{id}/refund-request
        [HttpPut("{id}/refund-request")]
        public async Task<IActionResult> RequestRefund(int id)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy thanh toán."
                });
            }

            if (payment.Status != "Paid")
            {
                return BadRequest(new
                {
                    message = "Chỉ có thanh toán đã thanh toán mới được yêu cầu hoàn tiền."
                });
            }

            payment.Status = "RefundRequested";
            payment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã gửi yêu cầu hoàn tiền.",
                payment.Id,
                payment.PaymentCode,
                payment.BookingId,
                payment.Amount,
                payment.Status,
                payment.UpdatedAt
            });
        }

        // GET: api/Payments/user/1
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var payments = await _context.Payments
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(payments);
        }
    }
}