using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PMRDA.Api.Auth;
using PMRDA.Api.Data;
using PMRDA.Api.Domain;

namespace PMRDA.Api.Features.Auth;

[ApiController, Route("api/auth")]
public sealed class AuthController(AppDbContext db, IOptions<JwtOptions> jwtOpts) : ControllerBase
{
    [AllowAnonymous, HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginInput input, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.LoginName == input.LoginName && u.IsActive, ct);
        if (user is null || !BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash))
            return Unauthorized(new { detail = "Invalid login name or password." });

        var token = CreateToken(user);
        return new LoginResponse(token.Token, token.ExpiresAt);
    }

    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me(CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? "0");
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return Unauthorized();

        var permissions = user.Role switch
        {
            SystemRole.Applicant     => Permissions.Applicant,
            SystemRole.Assistant     => Permissions.Assistant,
            SystemRole.Superintendent => Permissions.Superintendent,
            SystemRole.Authority     => Permissions.Authority,
            SystemRole.SuperAdmin    => Permissions.SuperAdmin,
            _ => Array.Empty<string>(),
        };

        return new MeResponse(user.Id, user.LoginName, user.FullName, user.Email, user.Role.ToString(), permissions, user.MustChangePassword);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordInput input, CancellationToken ct)
    {
        var id = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? "0");
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return Unauthorized();
        if (!BCrypt.Net.BCrypt.Verify(input.CurrentPassword, user.PasswordHash))
            return BadRequest(new { detail = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.NewPassword);
        user.MustChangePassword = false;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private (string Token, DateTime ExpiresAt) CreateToken(User user)
    {
        var jwt = jwtOpts.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var exp = DateTime.UtcNow.AddHours(jwt.ExpiryHours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.LoginName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var token = new JwtSecurityToken(jwt.Issuer, jwt.Audience, claims, expires: exp, signingCredentials: creds);
        return (new JwtSecurityTokenHandler().WriteToken(token), exp);
    }
}

public sealed record LoginInput([Required] string LoginName, [Required] string Password);
public sealed record LoginResponse(string Token, DateTime ExpiresAt);
public sealed record MeResponse(int Id, string LoginName, string DisplayName, string Email, string Role, string[] Permissions, bool MustChangePassword);
public sealed record ChangePasswordInput([Required] string CurrentPassword, [Required, MinLength(8)] string NewPassword);

public sealed class JwtOptions
{
    public string Key { get; set; } = "change-me-in-production-this-must-be-long-enough";
    public string Issuer { get; set; } = "pmrda-api";
    public string Audience { get; set; } = "pmrda-web";
    public int ExpiryHours { get; set; } = 8;
}
