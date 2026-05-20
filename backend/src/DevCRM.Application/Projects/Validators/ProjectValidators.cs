using DevCRM.Application.Projects.Dtos;
using DevCRM.Domain.Entities;
using FluentValidation;

namespace DevCRM.Application.Projects.Validators;

public class CreateProjectValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectValidator()
    {
        RuleFor(p => p.Title).NotEmpty().MaximumLength(150);
        RuleFor(p => p.Type).IsInEnum();
        RuleFor(p => p.Price).GreaterThanOrEqualTo(0);
        RuleFor(p => p.PricingModel).IsInEnum();
        RuleFor(p => p.StartDate).NotEmpty();
        RuleFor(p => p.EndDate).NotEmpty()
            .GreaterThanOrEqualTo(p => p.StartDate).WithMessage("EndDate must be >= StartDate");
        RuleFor(p => p.HostingProvider).MaximumLength(100);
        RuleFor(p => p.DriveLink).MaximumLength(2048);
        RuleFor(p => p.GitHubRepoUrl).MaximumLength(2048);
        RuleFor(p => p.ExternalDatabase).MaximumLength(100);
        RuleFor(p => p.Notes).MaximumLength(4000);
        RuleFor(p => p).Must(p => p.ClientId.HasValue || p.NewClient is not null)
            .WithMessage("Either ClientId or NewClient must be provided.");
        When(p => p.Type == ProjectType.LandingPage || p.Type == ProjectType.ErpCrm, () =>
        {
            RuleFor(p => p.HostingProvider).NotEmpty()
                .WithMessage("HostingProvider is required for LandingPage / ErpCrm.");
        });
        When(p => p.Type == ProjectType.Servicios, () =>
        {
            RuleFor(p => p.Services).NotNull().Must(s => s != null && s.Count > 0)
                .WithMessage("At least one service is required.");
        });
        When(p => p.PricingModel == PricingModel.Monthly || p.PricingModel == PricingModel.Subscription, () =>
        {
            RuleFor(p => p.NextPaymentDate).NotNull()
                .WithMessage("NextPaymentDate is required for recurring pricing.");
        });
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
        RuleFor(p => p.Type).IsInEnum();
        RuleFor(p => p.Price).GreaterThanOrEqualTo(0);
        RuleFor(p => p.PricingModel).IsInEnum();
        RuleFor(p => p.EndDate).GreaterThanOrEqualTo(p => p.StartDate);
        RuleFor(p => p.HostingProvider).MaximumLength(100);
        RuleFor(p => p.Notes).MaximumLength(4000);
    }
}
