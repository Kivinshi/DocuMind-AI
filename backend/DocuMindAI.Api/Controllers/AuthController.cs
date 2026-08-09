using BCrypt.Net;
using DocuMindAI.Api.Data;
using DocuMindAI.Api.DTOs;
using DocuMindAI.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocuMindAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // REGISTER
    // POST: /api/auth/register
    // =====================================================

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        // -------------------------------------------------
        // 1. Normalize email
        // -------------------------------------------------

        var email = request.Email.Trim().ToLowerInvariant();


        // -------------------------------------------------
        // 2. Check if email already exists
        // -------------------------------------------------

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (existingUser != null)
        {
            return Conflict(new
            {
                message = "A user with this email already exists."
            });
        }


        // -------------------------------------------------
        // 3. Hash password using BCrypt
        // -------------------------------------------------

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(
            request.Password
        );


        // -------------------------------------------------
        // 4. Create new user
        // -------------------------------------------------

        var user = new User
        {
            Email = email,

            PasswordHash = passwordHash,

            CreatedAt = DateTime.UtcNow,

            PlanType = "Free"
        };


        // -------------------------------------------------
        // 5. Add user to database
        // -------------------------------------------------

        _context.Users.Add(user);

        await _context.SaveChangesAsync();


        // -------------------------------------------------
        // 6. Create response
        // -------------------------------------------------

        var response = new AuthResponse
        {
            UserId = user.Id,

            Email = user.Email,

            PlanType = user.PlanType
        };


        // -------------------------------------------------
        // 7. Return 201 Created
        // -------------------------------------------------

        return StatusCode(
            StatusCodes.Status201Created,
            response
        );
    }
}

