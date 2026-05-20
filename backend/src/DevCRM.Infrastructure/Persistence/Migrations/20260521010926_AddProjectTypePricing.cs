using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevCRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectTypePricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "HostingProvider",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextPaymentDate",
                table: "Projects",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PricingModel",
                table: "Projects",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Services",
                table: "Projects",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Projects",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_NextPaymentDate",
                table: "Projects",
                column: "NextPaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Type",
                table: "Projects",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Projects_NextPaymentDate",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_Type",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "NextPaymentDate",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "PricingModel",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Services",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "HostingProvider",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);
        }
    }
}
