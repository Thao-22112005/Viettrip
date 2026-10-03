using Microsoft.EntityFrameworkCore;
using VietTrip.TourService.Data;
using VietTrip.TourService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<TourDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    ));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var mediaServiceBaseUrl =
    builder.Configuration["MediaService:BaseUrl"];

if (string.IsNullOrWhiteSpace(mediaServiceBaseUrl))
{
    throw new InvalidOperationException(
        "MediaService:BaseUrl is missing."
    );
}

builder.Services.AddHttpClient<IMediaServiceClient, MediaServiceClient>(
    client =>
    {
        client.BaseAddress =
            new Uri(mediaServiceBaseUrl);

        client.Timeout =
            TimeSpan.FromMinutes(2);
    });
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
