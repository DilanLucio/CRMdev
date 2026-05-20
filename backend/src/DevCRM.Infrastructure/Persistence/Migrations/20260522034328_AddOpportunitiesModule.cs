using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevCRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunitiesModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Opportunities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DevelopmentPossibility = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExternalLeadId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DiscardReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opportunities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ContactEmail",
                table: "Opportunities",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ExternalLeadId",
                table: "Opportunities",
                column: "ExternalLeadId",
                unique: true,
                filter: "[ExternalLeadId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Opportunities");
        }
    }
}
