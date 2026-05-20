using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevCRM.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Title).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Price).IsRequired().HasColumnType("decimal(18,2)");
        builder.Property(p => p.StartDate).IsRequired();
        builder.Property(p => p.EndDate).IsRequired();
        builder.Property(p => p.DriveLink).HasMaxLength(2048);
        builder.Property(p => p.GitHubRepoUrl).HasMaxLength(2048);
        builder.Property(p => p.HostingProvider).IsRequired().HasMaxLength(100);
        builder.Property(p => p.ExternalDatabase).HasMaxLength(100);
        builder.Property(p => p.IsActive).IsRequired();

        builder.HasMany(p => p.Tasks)
            .WithOne(t => t.Project)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.IsActive);
        builder.HasIndex(p => p.EndDate);
    }
}
