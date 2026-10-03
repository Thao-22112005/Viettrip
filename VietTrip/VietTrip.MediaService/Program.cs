using Microsoft.EntityFrameworkCore;
using VietTrip.MediaService.Data;
using VietTrip.MediaService.Services;
using VietTrip.MediaService.Settings;

var builder = WebApplication.CreateBuilder(args);

// Cloudinary settings
var cloudinarySettings =
    builder.Configuration
        .GetSection("Cloudinary")
        .Get<CloudinarySettings>()
    ?? throw new InvalidOperationException(
        "Cloudinary configuration is missing."
    );

builder.Services.AddSingleton(cloudinarySettings);

builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<MediaDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration
            .GetConnectionString("DefaultConnection")
    )
);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
