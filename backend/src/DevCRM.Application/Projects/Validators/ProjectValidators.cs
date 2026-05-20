using DevCRM.Application.Projects.Dtos;
using FluentValidation;

namespace DevCRM.Application.Projects.Validators;

public class CreateProjectValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectValidator()
    {
        RuleFor(p => p.Title).NotEmpty().MaximumLength(150);
        RuleFor(p => p.Price).GreaterThanOrEqualTo(0);
        RuleFor(p => p.StartDate).NotEmpty();
        RuleFor(p => p.EndDate).NotEmpty()
            .GreaterThanOrEqualTo(p => p.StartDate).WithMessage("EndDate must be >= StartDate");
        RuleFor(p => p.HostingProvider).NotEmpty().MaximumLength(100);
        RuleFor(p => p.DriveLink).MaximumLength(2048);
        RuleFor(p => p.GitHubRepoUrl).MaximumLength(2048);
        RuleFor(p => p.ExternalDatabase).MaximumLength(100);
        RuleFor(p => p).Must(p => p.ClientId.HasValue || p.NewClient is not null)
            .WithMessage("Either ClientId or NewClient must be provided.");
        When(p => p.NewClient is not null, () =>
        {
            RuleFor(p => p.NewClient!.Name).NotEmpty().MaximumLength(150);
            RuleFor(p => p.NewClient!.ContactNumber).NotEmpty().MaximumLength(20);
        });
    }
}

public class UpdateProjectValidator : AbstractValidator<UpdateProjectDto>
{
    public UpdateProjectValidator()
    {
        RuleFor(p => p.Title).NotEmpty().MaximumLength(150);
        RuleFor(p => p.Price).GreaterThanOrEqualTo(0);
        RuleFor(p => p.EndDate).GreaterThanOrEqualTo(p => p.StartDate);
        RuleFor(p => p.HostingProvider).NotEmpty().MaximumLength(100);
    }
}
