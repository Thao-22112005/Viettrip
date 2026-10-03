using Microsoft.AspNetCore.Mvc;
using VietTrip.NotificationService.Services;

namespace VietTrip.NotificationService.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public NotificationsController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail(
            [FromBody] TestEmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ToEmail))
            {
                return BadRequest(new
                {
                    message = "Email người nhận không được để trống."
                });
            }

            await _emailService.SendEmailAsync(
                request.ToEmail,
                "VietTrip - Test Email",
                """
                <h2>Xin chào!</h2>
                <p>Đây là email test từ <strong>VietTrip Notification Service</strong>.</p>
                <p>Nếu bạn nhận được email này thì Email Service đã hoạt động thành công.</p>
                """
            );

            return Ok(new
            {
                message = "Gửi email thành công.",
                toEmail = request.ToEmail
            });
        }
    }

    public class TestEmailRequest
    {
        public string ToEmail { get; set; } = string.Empty;
    }
}