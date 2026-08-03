FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["PdfUtility.API/PdfUtility.API.csproj", "PdfUtility.API/"]
COPY ["PdfUtility.Application/PdfUtility.Application.csproj", "PdfUtility.Application/"]
COPY ["PdfUtility.Infrastructure/PdfUtility.Infrastructure.csproj", "PdfUtility.Infrastructure/"]

RUN dotnet restore "PdfUtility.API/PdfUtility.API.csproj"

# Copy all source files and publish release build
COPY . .
WORKDIR "/src/PdfUtility.API"
RUN dotnet publish "PdfUtility.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "PdfUtility.API.dll"]
