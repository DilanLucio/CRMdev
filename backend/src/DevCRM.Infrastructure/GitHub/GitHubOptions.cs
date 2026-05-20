namespace DevCRM.Infrastructure.GitHub;

public class GitHubOptions
{
    public const string SectionName = "GitHub";
    public string UserAgent { get; set; } = "DevCRM";
    public string? Token { get; set; }
}
