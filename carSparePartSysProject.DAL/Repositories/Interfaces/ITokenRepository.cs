using CarSparePartSys.Model;
using System.Collections.Generic;

using System.Security.Claims;

namespace CarSparePartSysProject.DAL.Repositories.Interfaces
{
    public interface ITokenRepository
    {
        string CreateToken(User user, IList<string> roles);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
