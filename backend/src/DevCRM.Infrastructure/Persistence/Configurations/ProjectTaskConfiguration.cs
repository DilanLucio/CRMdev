using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevCRM.Infrastructure.Persistence.Configurations;

public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> builder)
    {
        builder.ToTable("ProjectTasks");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Description).IsRequired().HasMaxLength(500);
        builder.Property(t => t.IsCompleted).IsRequired();
        builder.Property(t => t.CreatedAt).IsRequired();
    }
}
