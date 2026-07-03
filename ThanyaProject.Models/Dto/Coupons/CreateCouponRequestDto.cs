using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Coupons
{
    public class CreateCouponRequestDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string DiscountType { get; set; } = string.Empty;

        [Required]
        public decimal DiscountValue { get; set; }

        public decimal? MinOrderAmount { get; set; }

        public decimal? MaxDiscountAmount { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

    }
}
