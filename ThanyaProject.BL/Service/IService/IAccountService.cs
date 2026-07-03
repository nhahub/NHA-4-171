using CarSparePartSysProject.Models.Dto.Account;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service.IService
{
    public interface IAccountService
    {
        Task<AccountResponseDto> RegisterAsync(RegisterRequestDto dto);

        Task<AccountResponseDto> LoginAsync(LoginRequestDto dto);

        Task<AccountResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);

        Task LogoutAsync(int userId);

        Task<UserDto?> GetProfileAsync(int userId);

        Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto dto);

        Task ChangePasswordAsync(int userId, ChangePasswordRequestDto dto);
    }
}
