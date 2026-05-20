namespace DevCRM.Application.Clients.Dtos;

public record ClientDto(Guid Id, string Name, string ContactNumber, string? Email, DateTime CreatedAt);

public record CreateClientDto(string Name, string ContactNumber, string? Email);

public record UpdateClientDto(string Name, string ContactNumber, string? Email);
