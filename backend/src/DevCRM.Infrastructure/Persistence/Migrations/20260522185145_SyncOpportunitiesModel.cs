using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevCRM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SyncOpportunitiesModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OpportunityAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpportunityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OldStatus = table.Column<int>(type: "int", nullable: true),
                    NewStatus = table.Column<int>(type: "int", nullable: true),
                    Actor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    At = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityAuditLogs_At",
                table: "OpportunityAuditLogs",
                column: "At");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityAuditLogs_OpportunityId",
                table: "OpportunityAuditLogs",
                column: "OpportunityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OpportunityAuditLogs");
        }
    }
}
