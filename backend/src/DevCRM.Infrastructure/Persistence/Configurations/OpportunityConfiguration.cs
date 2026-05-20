using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevCRM.Infrastructure.Persistence.Configurations;

public class OpportunityConfiguration : IEntityTypeConfiguration<Opportunity>
{
    public void Configure(EntityTypeBuilder<Opportunity> builder)
    {
        builder.ToTable("Opportunities");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.CompanyName).IsRequired().HasMaxLength(200);
        builder.Property(o => o.ContactName).IsRequired().HasMaxLength(150);
        builder.Property(o => o.ContactEmail).IsRequired().HasMaxLength(150);
        builder.Property(o => o.DevelopmentPossibility).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(o => o.ExternalLeadId).HasMaxLength(100);
        builder.Property(o => o.Status).IsRequired();
        builder.Property(o => o.CreatedAt).IsRequired();
        builder.Property(o => o.UpdatedAt).IsRequired();
        builder.Property(o => o.DiscardReason).HasMaxLength(500);

        builder.HasIndex(o => o.ContactEmail);

        builder.HasIndex(o => o.ExternalLeadId)
            .IsUnique()
            .HasFilter("[ExternalLeadId] IS NOT NULL");
    }
}
