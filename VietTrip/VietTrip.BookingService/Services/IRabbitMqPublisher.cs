namespace VietTrip.BookingService.Services
{
    public interface IRabbitMqPublisher
    {
        Task PublishNotificationAsync(
            string toEmail,
            string subject,
            string body);
    }
}