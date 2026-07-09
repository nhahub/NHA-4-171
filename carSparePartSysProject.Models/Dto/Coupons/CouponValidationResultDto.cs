using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Coupons
{
    public class CouponValidationResultDto
    {
        public bool IsValid { get; set; }

        public string Message { get; set; } = string.Empty;

        public decimal DiscountAmount { get; set; }

        public CouponDto? Coupon { get; set; }
    }
}
