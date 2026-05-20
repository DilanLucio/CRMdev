namespace DevCRM.Application.GitHub;

public interface IGitHubReadmeService
{
    Task<string?> GetReadmeAsync(string ownerSlashRepo, CancellationToken ct = default);
}
