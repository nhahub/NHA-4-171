using System.ComponentModel.DataAnnotations;

namespace CarSparePartSysProject.Models.Dto.Account
{
    public class RoleUpdateRequestDto
    {
        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
