using DevCRM.Application;
using DevCRM.Application.Common;
using DevCRM.Infrastructure;
using DevCRM.Infrastructure.Persistence;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Metrics;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "DevCrmFrontend";

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(CorsPolicy, p => p
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" })
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddRateLimiter(opt =>
{
    opt.AddPolicy("ingest", httpContext =>
    {
        var apiKey = httpContext.Request.Headers["X-Api-Key"].ToString();
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: string.IsNullOrEmpty(apiKey) ? "anonymous" : apiKey,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window      = TimeSpan.FromMinutes(1),
                QueueLimit  = 0,
            });
    });
    opt.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddOpenTelemetry().WithMetrics(m => m
    .AddMeter("DevCRM.Opportunities")
    .AddAspNetCoreInstrumentation()
    .AddPrometheusExporter());

var app = builder.Build();

app.UseExceptionHandler(handlerApp =>
{
    handlerApp.Run(async ctx =>
    {
        var feature = ctx.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;
        var (status, detail) = ex switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, ex.Message),
            ValidationException ve => (StatusCodes.Status400BadRequest, ve.Message),
            _ => (StatusCodes.Status500InternalServerError, "Unexpected error.")
        };
        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = detail });
    });
});

if (!app.Environment.IsEnvironment("Test"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<DevCrmDbContext>();
    db.Database.Migrate();
    if (app.Environment.IsDevelopment())
        DevCRM.WebAPI.Seed.DevSeed.Run(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors(CorsPolicy);
app.UseRateLimiter();
app.UseAuthorization();
app.MapPrometheusScrapingEndpoint();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program { }
