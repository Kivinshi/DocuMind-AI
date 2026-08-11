//using System.IdentityModel.Tokens.Jwt;
//using System.Security.Claims;
//using System.Text;
//using DocuMindAI.Api.Models;
//using Microsoft.IdentityModel.Tokens;

//namespace DocuMindAI.Api.Services;

//public class JwtService
//{
//    private readonly IConfiguration _configuration;

//    public JwtService(IConfiguration configuration)
//    {
//        _configuration = configuration;
//    }

//    public string GenerateToken(User user)
//    {
//        var secret = _configuration["Jwt:Secret"];

//        if (string.IsNullOrWhiteSpace(secret))
//        {
//            throw new InvalidOperationException(
//                "JWT secret is not configured."
//            );
//        }

//        var issuer = _configuration["Jwt:Issuer"];

//        var audience = _configuration["Jwt:Audience"];

//        var claims = new List<Claim>
//        {
//            new Claim(
//                JwtRegisteredClaimNames.Sub,
//                user.Id.ToString()
//            ),

//            new Claim(
//                JwtRegisteredClaimNames.Email,
//                user.Email
//            ),

//            new Claim(
//                ClaimTypes.NameIdentifier,
//                user.Id.ToString()
//            ),

//            new Claim(
//                ClaimTypes.Email,
//                user.Email
//            ),

//            new Claim(
//                "plan",
//                user.PlanType
//            )
//        };

//        var key = new SymmetricSecurityKey(
//            Encoding.UTF8.GetBytes(secret)
//        );

//        var credentials = new SigningCredentials(
//            key,
//            SecurityAlgorithms.HmacSha256
//        );

//        var token = new JwtSecurityToken(
//            issuer: issuer,
//            audience: audience,
//            claims: claims,
//            expires: DateTime.UtcNow.AddHours(24),
//            signingCredentials: credentials
//        );

//        return new JwtSecurityTokenHandler()
//            .WriteToken(token);
//    }
//}


using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DocuMindAI.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace DocuMindAI.Api.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        // =====================================================
        // GET JWT CONFIGURATION
        // =====================================================

        var secret = _configuration["Jwt:Secret"];
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        // =====================================================
        // VALIDATE CONFIGURATION
        // =====================================================

        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException(
                "Jwt:Secret is missing from configuration."
            );
        }

        if (string.IsNullOrWhiteSpace(issuer))
        {
            throw new InvalidOperationException(
                "Jwt:Issuer is missing from configuration."
            );
        }

        if (string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException(
                "Jwt:Audience is missing from configuration."
            );
        }

        // =====================================================
        // JWT SECRET MUST BE STRONG ENOUGH
        // =====================================================

        var keyBytes = Encoding.UTF8.GetBytes(secret);

        if (keyBytes.Length < 32)
        {
            throw new InvalidOperationException(
                "Jwt:Secret must be at least 32 bytes long."
            );
        }

        var key = new SymmetricSecurityKey(keyBytes);

        // =====================================================
        // CLAIMS
        // =====================================================

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

            new Claim(
                ClaimTypes.Name,
                user.Email
            ),

            new Claim(
                "planType",
                user.PlanType ?? "Free"
            )
        };

        // =====================================================
        // CREDENTIALS
        // =====================================================

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        // =====================================================
        // TOKEN
        // =====================================================

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        // =====================================================
        // RETURN TOKEN
        // =====================================================

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}