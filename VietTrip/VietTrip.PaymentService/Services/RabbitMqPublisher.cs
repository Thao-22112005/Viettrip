using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace VietTrip.PaymentService.Services
{
    public class RabbitMqPublisher : IRabbitMqPublisher
    {
        private readonly IConfiguration _configuration;

        public RabbitMqPublisher(
            IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task PublishNotificationAsync(
            string toEmail,
            string subject,
            string body)
        {
            var settings =
                _configuration.GetSection("RabbitMq");

            var factory = new ConnectionFactory
            {
                HostName =
                    settings["Host"] ?? "localhost",

                Port = int.Parse(
                    settings["Port"] ?? "5672"
                ),

                UserName =
                    settings["Username"] ?? "guest",

                Password =
                    settings["Password"] ?? "guest"
            };

            var queueName =
                settings["QueueName"]
                ?? "viettrip.notifications";

            await using var connection =
                await factory.CreateConnectionAsync();

            await using var channel =
                await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            var message = new
            {
                toEmail,
                subject,
                body
            };

            var json =
                JsonSerializer.Serialize(message);

            var messageBody =
                Encoding.UTF8.GetBytes(json);

            await channel.BasicPublishAsync(
                exchange: "",
                routingKey: queueName,
                mandatory: false,
                basicProperties: new BasicProperties
                {
                    Persistent = true
                },
                body: messageBody
            );
        }
    }
}