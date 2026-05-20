using DevCRM.Application.Clients.Services;
using DevCRM.Application.Projects.Services;
using DevCRM.Application.Tasks.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace DevCRM.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
