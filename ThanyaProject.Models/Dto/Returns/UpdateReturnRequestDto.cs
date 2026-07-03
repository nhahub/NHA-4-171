using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Returns
{
    public class UpdateReturnRequestDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        public decimal? RefundAmount { get; set; }

        public string? Notes { get; set; }
    }
}
