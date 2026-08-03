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

// CORS — restrict to known origins in production; wildcard only for dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
              .AllowAnyHeader()
              .AllowAnyMethod();
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

// Enable Swagger in all environments (including production cloud deployments)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PDF Utility API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("DefaultPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();