using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Account
{
    public class AccountResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;

        public UserDto User { get; set; } = new();
    }
}
