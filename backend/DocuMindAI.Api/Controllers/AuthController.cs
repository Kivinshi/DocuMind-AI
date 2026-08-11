using BCrypt.Net;
using DocuMindAI.Api.Data;
using DocuMindAI.Api.DTOs;
using DocuMindAI.Api.Models;
using DocuMindAI.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocuMindAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(
        AppDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }


    // =====================================================
    // REGISTER
    // POST: /api/auth/register
    // =====================================================

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();


        // -------------------------------------------------
        // Check duplicate email
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
        // Hash password
        // -------------------------------------------------

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(
            request.Password
        );


        // -------------------------------------------------
        // Create user
        // -------------------------------------------------

        var user = new User
        {
            Email = email,

            PasswordHash = passwordHash,

            CreatedAt = DateTime.UtcNow,

            PlanType = "Free"
        };


        _context.Users.Add(user);

        await _context.SaveChangesAsync();


        // -------------------------------------------------
        // Generate JWT
        // -------------------------------------------------

        var token = _jwtService.GenerateToken(user);


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        var response = new AuthResponse
        {
            UserId = user.Id,

            Email = user.Email,

            PlanType = user.PlanType,

            Token = token
        };


        return StatusCode(
            StatusCodes.Status201Created,
            response
        );
    }


    // =====================================================
    // LOGIN
    // POST: /api/auth/login
    // =====================================================

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();


        // -------------------------------------------------
        // Find user
        // -------------------------------------------------

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);


        // -------------------------------------------------
        // Don't reveal whether email exists
        // -------------------------------------------------

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }


        // -------------------------------------------------
        // Verify password
        // -------------------------------------------------

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );


        if (!passwordValid)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }


        // -------------------------------------------------
        // Generate JWT
        // -------------------------------------------------

        var token = _jwtService.GenerateToken(user);


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        var response = new AuthResponse
        {
            UserId = user.Id,

            Email = user.Email,

            PlanType = user.PlanType,

            Token = token
        };


        return Ok(response);
    }

    // =====================================================
    // CURRENT USER
    // GET: /api/auth/me
    // =====================================================

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        )?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            PlanType = user.PlanType
        });
    }
}