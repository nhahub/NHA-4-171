using CarSparePartSysProject.BL.Service.IService;
using CarSparePartSysProject.Models.Dto.Account;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Linq;

namespace CarSparePartSysProject.BL.Service
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ITokenRepository _tokenRepository;

        public AccountService(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ITokenRepository tokenRepository)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenRepository = tokenRepository;
        }

        public async Task<AccountResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                UserName = dto.Username,
                Email = dto.Email,
                PhoneNumber = dto.Phone,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var userRole = await _roleManager.FindByNameAsync("User");
            if (userRole != null)
            {
                user.RoleId = userRole.Id;
            }

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                throw new ArgumentException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);
            var token = _tokenRepository.CreateToken(user, roles);
            var refreshToken = _tokenRepository.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AccountResponseDto
            {
                AccessToken = token,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    UserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Username = user.UserName!,
                    Email = user.Email!,
                    Phone = user.PhoneNumber,
                    Role = "User"
                }
            };
        }

        public async Task<AccountResponseDto> LoginAsync(LoginRequestDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.EmailOrUsername) 
                        ?? await _userManager.FindByNameAsync(dto.EmailOrUsername);

            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                throw new UnauthorizedAccessException("Invalid email/username or password.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = _tokenRepository.CreateToken(user, roles);
            var refreshToken = _tokenRepository.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AccountResponseDto
            {
                AccessToken = token,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    UserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Username = user.UserName!,
                    Email = user.Email!,
                    Phone = user.PhoneNumber,
                    Role = roles.FirstOrDefault() ?? "User"
                }
            };
        }

        public async Task<AccountResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
        {
            var principal = _tokenRepository.GetPrincipalFromExpiredToken(dto.AccessToken);
            if (principal == null)
            {
                throw new ArgumentException("Invalid access token or refresh token.");
            }

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new ArgumentException("Invalid user claims in access token.");
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new ArgumentException("Invalid access token or refresh token.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var newAccessToken = _tokenRepository.CreateToken(user, roles);
            var newRefreshToken = _tokenRepository.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AccountResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new UserDto
                {
                    UserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Username = user.UserName!,
                    Email = user.Email!,
                    Phone = user.PhoneNumber,
                    Role = roles.FirstOrDefault() ?? "User"
                }
            };
        }

        public async Task LogoutAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _userManager.UpdateAsync(user);
            }
        }

        public async Task<UserDto?> GetProfileAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Username = user.UserName!,
                Email = user.Email!,
                Phone = user.PhoneNumber,
                Role = roles.FirstOrDefault() ?? "User"
            };
        }

        public async Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            user.PhoneNumber = dto.Phone ?? user.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new ArgumentException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Username = user.UserName!,
                Email = user.Email!,
                Phone = user.PhoneNumber,
                Role = roles.FirstOrDefault() ?? "User"
            };
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordRequestDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                throw new ArgumentException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
    }
}
