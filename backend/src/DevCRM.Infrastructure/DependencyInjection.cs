using DevCRM.Application.GitHub;
using DevCRM.Domain.Interfaces;
using DevCRM.Infrastructure.GitHub;
using DevCRM.Infrastructure.Persistence;
using DevCRM.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace DevCRM.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<DevCrmDbContext>(opt =>
            opt.UseSqlServer(config.GetConnectionString("DevCrm")));

        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IProjectTaskRepository, ProjectTaskRepository>();
        services.AddScoped<IOpportunityRepository, OpportunityRepository>();
        services.AddScoped<IOpportunityAuditRepository, OpportunityAuditRepository>();

        services.Configure<GitHubOptions>(config.GetSection(GitHubOptions.SectionName));

        services.AddHttpClient(GitHubReadmeService.HttpClientName, (sp, client) =>
        {
            var options = sp.GetRequiredService<IOptions<GitHubOptions>>().Value;
            client.BaseAddress = new Uri("https://api.github.com/");
            client.DefaultRequestHeaders.UserAgent.ParseAdd(
                string.IsNullOrWhiteSpace(options.UserAgent) ? "DevCRM" : options.UserAgent);
            if (!string.IsNullOrWhiteSpace(options.Token))
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", options.Token);
        });

        services.AddScoped<IGitHubReadmeService, GitHubReadmeService>();

        return services;
    }
}
