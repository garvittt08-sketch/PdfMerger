using PdfUtility.Api.Middleware;
using PdfUtility.Application.Interfaces;
using PdfUtility.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Dynamically bind to PORT environment variable if set by cloud hosts (e.g. Render)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://+:{port}");
}

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI — scoped is fine since dfService is stateless per request
builder.Services.AddScoped<IPdfService, PdfService>();

// CORS — Bulletproof policy allowing any origin (Vercel, localhost, etc.), headers, methods, & credentials
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Global upload size limits (defense in depth alongside [RequestSizeLimit])
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100 MB
});

var app = builder.Build();

// Enable CORS FIRST before all other middleware and endpoints
app.UseCors("DefaultPolicy");

// Custom middleware for exception handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable Swagger in all environments (including production cloud deployments)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PDF Utility API v1");
    c.RoutePrefix = "swagger";
});

app.UseAuthorization();
app.MapControllers();

app.Run();