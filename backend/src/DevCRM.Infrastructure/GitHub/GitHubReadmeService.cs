using System.Net;
using System.Net.Http.Headers;
using DevCRM.Application.GitHub;

namespace DevCRM.Infrastructure.GitHub;

public class GitHubReadmeService : IGitHubReadmeService
{
    public const string HttpClientName = "GitHub";

    private readonly HttpClient _http;

    public GitHubReadmeService(IHttpClientFactory factory) => _http = factory.CreateClient(HttpClientName);

    public async Task<string?> GetReadmeAsync(string ownerSlashRepo, CancellationToken ct = default)
    {
        var normalized = Normalize(ownerSlashRepo);
        if (string.IsNullOrWhiteSpace(normalized)) return null;

        using var request = new HttpRequestMessage(HttpMethod.Get, $"repos/{normalized}/readme");
        request.Headers.Accept.Clear();
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3.raw"));

        using var response = await _http.SendAsync(request, ct);
        if (response.StatusCode == HttpStatusCode.NotFound) return null;
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync(ct);
    }

    private static string Normalize(string raw)
    {
        var value = raw.Trim();
        if (value.StartsWith("https://github.com/", StringComparison.OrdinalIgnoreCase))
            value = value["https://github.com/".Length..];
        else if (value.StartsWith("http://github.com/", StringComparison.OrdinalIgnoreCase))
            value = value["http://github.com/".Length..];
        if (value.EndsWith(".git", StringComparison.OrdinalIgnoreCase))
            value = value[..^4];
        return value.Trim('/');
    }
}
