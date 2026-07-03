using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.BL.Service;
using CarSparePartSysProject.BL.Service.IService;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Account;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace CarSparePartSys.Tests
{
    public class AuthenticationTests
    {
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly Mock<ITokenRepository> _tokenRepositoryMock;
        private readonly AccountService _accountService;

        public AuthenticationTests()
        {
            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);
            
            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(roleStoreMock.Object, null!, null!, null!, null!);
            
            _tokenRepositoryMock = new Mock<ITokenRepository>();
            _accountService = new AccountService(_userManagerMock.Object, _roleManagerMock.Object, _tokenRepositoryMock.Object);
        }

        [Fact]
        public async Task RegisterAsync_ValidDto_ReturnsTokensAndUserDetails()
        {
            // Arrange
            var dto = new RegisterRequestDto
            {
                FirstName = "First",
                LastName = "Last",
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            var userRole = new Role { Id = 1, Name = "User" };
            _roleManagerMock.Setup(r => r.FindByNameAsync("User")).ReturnsAsync(userRole);
            
            _userManagerMock.Setup(u => u.CreateAsync(It.IsAny<User>(), dto.Password))
                .ReturnsAsync(IdentityResult.Success)
                .Callback<User, string>((u, p) => u.Id = 1);

            _userManagerMock.Setup(u => u.AddToRoleAsync(It.IsAny<User>(), "User")).ReturnsAsync(IdentityResult.Success);
            _userManagerMock.Setup(u => u.GetRolesAsync(It.IsAny<User>())).ReturnsAsync(new List<string> { "User" });
            _userManagerMock.Setup(u => u.UpdateAsync(It.IsAny<User>())).ReturnsAsync(IdentityResult.Success);

            _tokenRepositoryMock.Setup(t => t.CreateToken(It.IsAny<User>(), It.IsAny<IList<string>>())).Returns("dummy_access_token");
            _tokenRepositoryMock.Setup(t => t.GenerateRefreshToken()).Returns("dummy_refresh_token");

            // Act
            var result = await _accountService.RegisterAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.AccessToken.Should().Be("dummy_access_token");
            result.RefreshToken.Should().Be("dummy_refresh_token");
            result.User.Email.Should().Be(dto.Email);
            result.User.Username.Should().Be(dto.Username);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsTokens()
        {
            // Arrange
            var dto = new LoginRequestDto
            {
                EmailOrUsername = "test@example.com",
                Password = "Password123!"
            };

            var user = new User { Id = 1, Email = "test@example.com", UserName = "testuser" };
            _userManagerMock.Setup(u => u.FindByEmailAsync(dto.EmailOrUsername)).ReturnsAsync(user);
            _userManagerMock.Setup(u => u.CheckPasswordAsync(user, dto.Password)).ReturnsAsync(true);
            _userManagerMock.Setup(u => u.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });
            _userManagerMock.Setup(u => u.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

            _tokenRepositoryMock.Setup(t => t.CreateToken(user, It.IsAny<IList<string>>())).Returns("new_access_token");
            _tokenRepositoryMock.Setup(t => t.GenerateRefreshToken()).Returns("new_refresh_token");

            // Act
            var result = await _accountService.LoginAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.AccessToken.Should().Be("new_access_token");
            result.RefreshToken.Should().Be("new_refresh_token");
        }

        [Fact]
        public async Task LoginAsync_InvalidCredentials_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var dto = new LoginRequestDto { EmailOrUsername = "invalid@example.com", Password = "WrongPassword" };
            _userManagerMock.Setup(u => u.FindByEmailAsync(dto.EmailOrUsername)).ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _accountService.LoginAsync(dto));
        }

        [Fact]
        public async Task RefreshTokenAsync_ValidTokens_RotatesTokens()
        {
            // Arrange
            var dto = new RefreshTokenRequestDto
            {
                AccessToken = "expired_access_token",
                RefreshToken = "current_refresh_token"
            };

            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            }));

            _tokenRepositoryMock.Setup(t => t.GetPrincipalFromExpiredToken(dto.AccessToken)).Returns(claimsPrincipal);

            var user = new User
            {
                Id = 1,
                RefreshToken = "current_refresh_token",
                RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1)
            };

            _userManagerMock.Setup(u => u.FindByIdAsync("1")).ReturnsAsync(user);
            _userManagerMock.Setup(u => u.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });
            _userManagerMock.Setup(u => u.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

            _tokenRepositoryMock.Setup(t => t.CreateToken(user, It.IsAny<IList<string>>())).Returns("rotated_access_token");
            _tokenRepositoryMock.Setup(t => t.GenerateRefreshToken()).Returns("rotated_refresh_token");

            // Act
            var result = await _accountService.RefreshTokenAsync(dto);

            // Assert
            result.AccessToken.Should().Be("rotated_access_token");
            result.RefreshToken.Should().Be("rotated_refresh_token");
            user.RefreshToken.Should().Be("rotated_refresh_token"); // Rotation completed
        }

        [Fact]
        public async Task RefreshTokenAsync_ExpiredRefreshToken_ThrowsArgumentException()
        {
            // Arrange
            var dto = new RefreshTokenRequestDto { AccessToken = "valid_access", RefreshToken = "expired_refresh" };
            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "1") }));
            _tokenRepositoryMock.Setup(t => t.GetPrincipalFromExpiredToken(dto.AccessToken)).Returns(claimsPrincipal);

            var user = new User { Id = 1, RefreshToken = "expired_refresh", RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(-1) };
            _userManagerMock.Setup(u => u.FindByIdAsync("1")).ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _accountService.RefreshTokenAsync(dto));
        }

        [Fact]
        public async Task LogoutAsync_ValidUserId_ClearsRefreshToken()
        {
            // Arrange
            var user = new User { Id = 1, RefreshToken = "some_token", RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1) };
            _userManagerMock.Setup(u => u.FindByIdAsync("1")).ReturnsAsync(user);
            _userManagerMock.Setup(u => u.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

            // Act
            await _accountService.LogoutAsync(1);

            // Assert
            user.RefreshToken.Should().BeNull();
            user.RefreshTokenExpiryTime.Should().BeNull();
        }
    }
}
