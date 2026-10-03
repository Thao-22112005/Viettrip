using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace VietTrip.NotificationService.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string body)
        {
            var emailSettings = _configuration
                .GetSection("EmailSettings");

            var smtpServer = emailSettings["SmtpServer"];
            var smtpPort = int.Parse(
                emailSettings["SmtpPort"]!
            );

            var senderEmail = emailSettings["SenderEmail"];
            var senderName = emailSettings["SenderName"];

            var smtpUsername = _configuration[
                "EmailSettings:SmtpUsername"
            ];

            var smtpPassword = _configuration[
                "EmailSettings:SmtpPassword"
            ];

            var email = new MimeMessage();

            email.From.Add(
                new MailboxAddress(
                    senderName,
                    senderEmail
                )
            );

            email.To.Add(
                MailboxAddress.Parse(toEmail)
            );

            email.Subject = subject;

            email.Body = new TextPart("html")
            {
                Text = body
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                smtpServer,
                smtpPort,
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                smtpUsername,
                smtpPassword
            );

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
    }
}