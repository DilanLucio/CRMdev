namespace DevCRM.Application.Common;

public class NotFoundException : Exception
{
    public NotFoundException(string entity, Guid id) : base($"{entity} with id {id} not found.") { }
}
