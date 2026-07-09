using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Orders
{
    public class ApplyCouponRequestDto
    {
        [Required]
        public string CouponCode { get; set; } = string.Empty;
    }
}
