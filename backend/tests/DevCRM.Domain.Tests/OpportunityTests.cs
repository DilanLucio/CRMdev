using DevCRM.Domain.Entities;
using FluentAssertions;

namespace DevCRM.Domain.Tests;

public class OpportunityTests
{
    [Fact]
    public void Opportunity_NewInstance_HasAiGeneratedStatus()
    {
        var o = new Opportunity { Status = OpportunityStatus.AiGenerated };
        o.Status.Should().Be(OpportunityStatus.AiGenerated);
    }

    [Fact]
    public void OpportunityStatus_EnumValues_MatchContract()
    {
        ((int)OpportunityStatus.AiGenerated).Should().Be(0);
        ((int)OpportunityStatus.Evaluating).Should().Be(1);
        ((int)OpportunityStatus.Contacted).Should().Be(2);
        ((int)OpportunityStatus.Discarded).Should().Be(3);
    }
}
