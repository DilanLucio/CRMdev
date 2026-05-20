using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Domain.Entities;
using FluentValidation;

namespace DevCRM.Application.Opportunities.Validators;

public class CreateOpportunityValidator : AbstractValidator<CreateOpportunityDto>
{
    public CreateOpportunityValidator()
    {
        RuleFor(x => x.CompanyName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ContactEmail).NotEmpty().EmailAddress().MaximumLength(150);
        RuleFor(x => x.DevelopmentPossibility).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.ExternalLeadId).MaximumLength(100).When(x => x.ExternalLeadId is not null);
    }
}

public class UpdateOpportunityStatusValidator : AbstractValidator<UpdateOpportunityStatusDto>
{
    public UpdateOpportunityStatusValidator()
    {
        RuleFor(x => x.DiscardReason)
            .NotEmpty()
            .MaximumLength(500)
            .When(x => x.Status == OpportunityStatus.Discarded)
            .WithMessage("DiscardReason is required when discarding an opportunity.");
    }
}
