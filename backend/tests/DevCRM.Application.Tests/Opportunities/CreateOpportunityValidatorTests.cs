using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Application.Opportunities.Validators;
using DevCRM.Domain.Entities;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace DevCRM.Application.Tests.Opportunities;

public class CreateOpportunityValidatorTests
{
    private readonly CreateOpportunityValidator _validator = new();

    [Fact]
    public void InvalidEmail_Fails()
    {
        var dto = new CreateOpportunityDto("Acme", "Jane", "not-an-email", "## ERP", null);
        _validator.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.ContactEmail);
    }

    [Fact]
    public void MissingDevelopmentPossibility_Fails()
    {
        var dto = new CreateOpportunityDto("Acme", "Jane", "jane@acme.com", "", null);
        _validator.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.DevelopmentPossibility);
    }

    [Fact]
    public void ValidPayload_Passes()
    {
        var dto = new CreateOpportunityDto("Acme Corp", "Jane Doe", "jane@acme.com", "## ERP integration", "lead-123");
        _validator.TestValidate(dto).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void MissingCompanyName_Fails()
    {
        var dto = new CreateOpportunityDto("", "Jane", "jane@acme.com", "## ERP", null);
        _validator.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.CompanyName);
    }
}

public class UpdateOpportunityStatusValidatorTests
{
    private readonly UpdateOpportunityStatusValidator _validator = new();

    [Fact]
    public void UpdateStatus_DiscardedWithoutReason_Fails()
    {
        var dto = new UpdateOpportunityStatusDto(OpportunityStatus.Discarded, null);
        _validator.TestValidate(dto).ShouldHaveValidationErrorFor(x => x.DiscardReason);
    }

    [Fact]
    public void UpdateStatus_DiscardedWithReason_Passes()
    {
        var dto = new UpdateOpportunityStatusDto(OpportunityStatus.Discarded, "Out of budget.");
        _validator.TestValidate(dto).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void UpdateStatus_EvaluatingNoReason_Passes()
    {
        var dto = new UpdateOpportunityStatusDto(OpportunityStatus.Evaluating, null);
        _validator.TestValidate(dto).ShouldNotHaveAnyValidationErrors();
    }
}
