using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace VietTrip.NotificationService.Services
{
    public class RabbitMqConsumer : BackgroundService, IRabbitMqConsumer
    {
        private readonly IConfiguration _configuration;
        private readonly IServiceScopeFactory _scopeFactory;

        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMqConsumer(
            IConfiguration configuration,
            IServiceScopeFactory scopeFactory)
        {
            _configuration = configuration;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            var rabbitMqSettings =
                _configuration.GetSection("RabbitMq");

            var host =
                rabbitMqSettings["Host"] ?? "localhost";

            var port = int.Parse(
                rabbitMqSettings["Port"] ?? "5672"
            );

            var username =
                rabbitMqSettings["Username"] ?? "guest";

            var password =
                rabbitMqSettings["Password"] ?? "guest";

            var queueName =
                rabbitMqSettings["QueueName"]
                ?? "viettrip.notifications";

            var factory = new ConnectionFactory
            {
                HostName = host,
                Port = port,
                UserName = username,
                Password = password
            };

            _connection =
                await factory.CreateConnectionAsync();

            _channel =
                await _connection.CreateChannelAsync();

            await _channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            Console.WriteLine(
                $"RabbitMQ connected. Queue: {queueName}"
            );

            var consumer =
                new AsyncEventingBasicConsumer(_channel);

            consumer.ReceivedAsync += async (sender, args) =>
            {
                try
                {
                    var body = args.Body.ToArray();

                    var message = Encoding.UTF8.GetString(body);

                    Console.WriteLine(
                        "RabbitMQ message received:"
                    );

                    Console.WriteLine(message);

                    var notification =
                        JsonSerializer.Deserialize<NotificationMessage>(
                            message,
                            new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            }
                        );

                    if (notification == null)
                    {
                        Console.WriteLine(
                            "Invalid notification message."
                        );

                        await _channel.BasicNackAsync(
                            args.DeliveryTag,
                            multiple: false,
                            requeue: false
                        );

                        return;
                    }

                    if (string.IsNullOrWhiteSpace(
                            notification.ToEmail))
                    {
                        Console.WriteLine(
                            "ToEmail is empty."
                        );

                        await _channel.BasicNackAsync(
                            args.DeliveryTag,
                            multiple: false,
                            requeue: false
                        );

                        return;
                    }

                    using var scope =
                        _scopeFactory.CreateScope();

                    var emailService =
                        scope.ServiceProvider
                            .GetRequiredService<IEmailService>();

                    await emailService.SendEmailAsync(
                        notification.ToEmail,
                        notification.Subject,
                        notification.Body
                    );

                    Console.WriteLine(
                        $"Email sent successfully to {notification.ToEmail}"
                    );

                    await _channel.BasicAckAsync(
                        args.DeliveryTag,
                        multiple: false
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        "Error processing RabbitMQ message:"
                    );

                    Console.WriteLine(ex.Message);

                    await _channel.BasicNackAsync(
                        args.DeliveryTag,
                        multiple: false,
                        requeue: true
                    );
                }
            };

            await _channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: false,
                consumer: consumer
            );

            try
            {
                await Task.Delay(
                    Timeout.Infinite,
                    stoppingToken
                );
            }
            catch (OperationCanceledException)
            {
                // Application is stopping.
            }
        }

        public override async Task StopAsync(
            CancellationToken cancellationToken)
        {
            if (_channel != null)
            {
                await _channel.CloseAsync();
            }

            if (_connection != null)
            {
                await _connection.CloseAsync();
            }

            await base.StopAsync(cancellationToken);
        }
    }

    public class NotificationMessage
    {
        public string ToEmail { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;
    }
}