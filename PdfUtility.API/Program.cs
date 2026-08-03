using PdfUtility.Api.Middleware;
using PdfUtility.Application.Interfaces;
using PdfUtility.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI — scoped is fine since dfService is stateless per request
builder.Services.AddScoped<IPdfService, PdfService>();

// CORS — allow configured origins, or allow all origins if unspecified for cloud deployments
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
        if (origins != null && origins.Length > 0)
        {
            policy.WithOrigins(origins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// Global upload size limits (defense in depth alongside [RequestSizeLimit])
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100 MB
});

var app = builder.Build();

// Custom middleware FIRST so it catches everything downstream
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable CORS
app.UseCors("DefaultPolicy");

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