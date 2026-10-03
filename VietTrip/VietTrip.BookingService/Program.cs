using Microsoft.EntityFrameworkCore;
using VietTrip.BookingService.Data;
using VietTrip.BookingService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<BookingDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    )
);

var tourServiceBaseUrl =
    builder.Configuration["TourService:BaseUrl"];

if (string.IsNullOrWhiteSpace(tourServiceBaseUrl))
{
    throw new InvalidOperationException(
        "TourService:BaseUrl is missing."
    );
}

builder.Services.AddHttpClient<
    ITourServiceClient,
    TourServiceClient
>(client =>
{
    client.BaseAddress =
        new Uri(tourServiceBaseUrl);

    client.Timeout =
        TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<
    IRabbitMqPublisher,
    RabbitMqPublisher
>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();