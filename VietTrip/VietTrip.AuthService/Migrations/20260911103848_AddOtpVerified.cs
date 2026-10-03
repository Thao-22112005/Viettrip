using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VietTrip.AuthService.Migrations
{
    /// <inheritdoc />
    public partial class AddOtpVerified : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "OtpCodes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "OtpCodes");
        }
    }
}
