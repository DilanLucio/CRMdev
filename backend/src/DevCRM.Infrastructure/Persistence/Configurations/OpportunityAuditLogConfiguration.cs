using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevCRM.Infrastructure.Persistence.Configurations;

public class OpportunityAuditLogConfiguration : IEntityTypeConfiguration<OpportunityAuditLog>
{
    public void Configure(EntityTypeBuilder<OpportunityAuditLog> builder)
    {
        builder.ToTable("OpportunityAuditLogs");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Action).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Actor).IsRequired().HasMaxLength(100);
        builder.Property(x => x.At).IsRequired();
        builder.Property(x => x.OldStatus).HasColumnType("int");
        builder.Property(x => x.NewStatus).HasColumnType("int");

        builder.HasIndex(x => x.OpportunityId);
        builder.HasIndex(x => x.At);
    }
}
