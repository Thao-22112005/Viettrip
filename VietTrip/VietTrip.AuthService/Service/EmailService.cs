using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace VietTrip.AuthService.Services
{
    public class EmailService
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
            var senderEmail =
                _configuration["EmailSettings:SenderEmail"];

            var appPassword =
                _configuration["EmailSettings:AppPassword"];

            var smtpServer =
                _configuration["EmailSettings:SmtpServer"];

            var smtpPort =
                int.Parse(
                    _configuration["EmailSettings:SmtpPort"]!
                );

            var email = new MimeMessage();

            email.From.Add(
                new MailboxAddress(
                    "VietTrip",
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
                senderEmail,
                appPassword
            );

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
    }
}