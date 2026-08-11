using System.Text;

using DocuMindAI.Api.Data;
using DocuMindAI.Api.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// CONFIGURATION
// =====================================================

var configuration = builder.Configuration;


// =====================================================
// JWT CONFIGURATION
// =====================================================

var jwtSecret = configuration["Jwt:Secret"];
var jwtIssuer = configuration["Jwt:Issuer"];
var jwtAudience = configuration["Jwt:Audience"];

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "Jwt:Secret is not configured."
    );
}

if (string.IsNullOrWhiteSpace(jwtIssuer))
{
    throw new InvalidOperationException(
        "Jwt:Issuer is not configured."
    );
}

if (string.IsNullOrWhiteSpace(jwtAudience))
{
    throw new InvalidOperationException(
        "Jwt:Audience is not configured."
    );
}


// =====================================================
// JWT SECRET VALIDATION
// =====================================================

var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtSecret);

if (jwtKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:Secret must be at least 32 characters long."
    );
}


// =====================================================
// DATABASE - SUPABASE POSTGRESQL
// =====================================================

var connectionString =
    configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured."
    );
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});


// =====================================================
// JWT AUTHENTICATION
// =====================================================

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(jwtKeyBytes),

                ValidateIssuer = true,

                ValidIssuer = jwtIssuer,

                ValidateAudience = true,

                ValidAudience = jwtAudience,

                ValidateLifetime = true,

                ClockSkew = TimeSpan.FromMinutes(1)
            };
    });


// =====================================================
// AUTHORIZATION
// =====================================================

builder.Services.AddAuthorization();


// =====================================================
// CONTROLLERS
// =====================================================

builder.Services.AddControllers();


// =====================================================
// APPLICATION SERVICES
// =====================================================

// JWT Service
builder.Services.AddScoped<JwtService>();

// Storage Service
builder.Services.AddScoped<StorageService>();

// PDF Text Extractor
builder.Services.AddScoped<PdfTextExtractor>();


// =====================================================
// HTTP CLIENT
// =====================================================

builder.Services.AddHttpClient();


// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

var supabaseUrl =
    configuration["Supabase:Url"];

var supabaseSecretKey =
    configuration["Supabase:SecretKey"];

if (string.IsNullOrWhiteSpace(supabaseUrl))
{
    throw new InvalidOperationException(
        "Supabase:Url is not configured."
    );
}

if (string.IsNullOrWhiteSpace(supabaseSecretKey))
{
    throw new InvalidOperationException(
        "Supabase:SecretKey is not configured."
    );
}


// =====================================================
// SUPABASE CLIENT
// =====================================================

var supabaseClient =
    new Supabase.Client(
        supabaseUrl,
        supabaseSecretKey
    );

await supabaseClient.InitializeAsync();

builder.Services.AddSingleton(supabaseClient);


// =====================================================
// CORS
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});


// =====================================================
// SWAGGER / OPENAPI
// =====================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    // -------------------------------------------------
    // Swagger Document
    // -------------------------------------------------

    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "DocuMind AI API",
            Version = "v1",
            Description = "Backend API for DocuMind AI"
        }
    );


    // -------------------------------------------------
    // JWT Bearer Authentication
    // -------------------------------------------------

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            In = ParameterLocation.Header,

            Description =
                "Enter your JWT token. Example: Bearer {token}"
        }
    );


    // -------------------------------------------------
    // JWT Security Requirement
    // -------------------------------------------------
    //
    // IMPORTANT:
    // Swashbuckle 10.x requires a function here.
    //

    options.AddSecurityRequirement(
        document =>
            new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference(
                        "Bearer",
                        document
                    ),

                    new List<string>()
                }
            }
    );
});


// =====================================================
// BUILD APPLICATION
// =====================================================

var app = builder.Build();


// =====================================================
// SWAGGER
// =====================================================

app.UseSwagger();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint(
        "/swagger/v1/swagger.json",
        "DocuMind AI API v1"
    );

    options.RoutePrefix = "swagger";
});


// =====================================================
// CORS
// =====================================================

app.UseCors("AllowFrontend");


// =====================================================
// HTTPS
// =====================================================

// Disabled for local development.
// app.UseHttpsRedirection();


// =====================================================
// AUTHENTICATION
// =====================================================

app.UseAuthentication();


// =====================================================
// AUTHORIZATION
// =====================================================

app.UseAuthorization();


// =====================================================
// CONTROLLERS
// =====================================================

app.MapControllers();


// =====================================================
// RUN
// =====================================================

app.Run();