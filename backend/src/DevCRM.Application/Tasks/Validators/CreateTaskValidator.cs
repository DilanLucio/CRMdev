using DevCRM.Application.Tasks.Dtos;
using FluentValidation;

namespace DevCRM.Application.Tasks.Validators;

public class CreateTaskValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskValidator()
    {
        RuleFor(t => t.Description).NotEmpty().MaximumLength(500);
    }
}
