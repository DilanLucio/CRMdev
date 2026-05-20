using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Cryptography;
using System.Text;

namespace DevCRM.WebAPI.Security;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ApiKeyAuthAttribute : Attribute, IAsyncActionFilter
{
    private const string ApiKeyHeader = "X-Api-Key";

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(ApiKeyHeader, out var providedKey) ||
            string.IsNullOrWhiteSpace(providedKey))
        {
            context.Result = new UnauthorizedObjectResult(new { title = "API key required." });
            return;
        }

        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var validKeys = config.GetSection("Ingestion:ApiKeys").Get<string[]>() ?? [];

        var provided = Encoding.UTF8.GetBytes(providedKey.ToString());
        var isValid = validKeys.Any(k =>
        {
            var keyBytes = Encoding.UTF8.GetBytes(k);
            if (keyBytes.Length != provided.Length) return false;
            return CryptographicOperations.FixedTimeEquals(keyBytes, provided);
        });

        if (!isValid)
        {
            context.Result = new ObjectResult(new { title = "Invalid API key." }) { StatusCode = StatusCodes.Status403Forbidden };
            return;
        }

        await next();
    }
}
