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
        // SECRET
        // =====================================================

        var keyBytes = Encoding.UTF8.GetBytes(secret);

        if (keyBytes.Length < 32)
        {
            throw new InvalidOperationException(
                "Jwt:Secret must be at least 32 bytes long."
            );
        }

        var securityKey =
            new SymmetricSecurityKey(keyBytes);

        // =====================================================
        // CLAIMS
        // =====================================================

        var claims = new List<Claim>
        {
            // Custom user ID claim.
            // This avoids claim-mapping problems.
            new Claim(
                "userId",
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
        // SIGNING CREDENTIALS
        // =====================================================

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        // =====================================================
        // CREATE JWT
        // =====================================================

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
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