using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VietTrip.TourService.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartureAndTransportToTour : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Departure",
                table: "Tours",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Transport",
                table: "Tours",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Departure",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "Transport",
                table: "Tours");
        }
    }
}
