using DevCRM.Application.Clients.Dtos;
using FluentValidation;

namespace DevCRM.Application.Clients.Validators;

public class CreateClientValidator : AbstractValidator<CreateClientDto>
{
    public CreateClientValidator()
    {
        RuleFor(c => c.Name).NotEmpty().MaximumLength(150);
        RuleFor(c => c.ContactNumber).NotEmpty().MaximumLength(20);
        RuleFor(c => c.Email).MaximumLength(100).EmailAddress().When(c => !string.IsNullOrWhiteSpace(c.Email));
    }
}

public class UpdateClientValidator : AbstractValidator<UpdateClientDto>
{
    public UpdateClientValidator()
    {
        RuleFor(c => c.Name).NotEmpty().MaximumLength(150);
        RuleFor(c => c.ContactNumber).NotEmpty().MaximumLength(20);
        RuleFor(c => c.Email).MaximumLength(100).EmailAddress().When(c => !string.IsNullOrWhiteSpace(c.Email));
    }
}
