using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Coupons
{
    public class ValidateCouponRequestDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public decimal OrderTotal { get; set; }
    }
}
