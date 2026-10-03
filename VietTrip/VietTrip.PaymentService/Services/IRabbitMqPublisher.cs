namespace VietTrip.PaymentService.Services
{
    public interface IRabbitMqPublisher
    {
        Task PublishNotificationAsync(
            string toEmail,
            string subject,
            string body);
    }
}