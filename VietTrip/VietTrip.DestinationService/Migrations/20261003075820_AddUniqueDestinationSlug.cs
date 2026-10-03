using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VietTrip.DestinationService.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueDestinationSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Destinations_Slug",
                table: "Destinations",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Destinations_Slug",
                table: "Destinations");
        }
    }
}
