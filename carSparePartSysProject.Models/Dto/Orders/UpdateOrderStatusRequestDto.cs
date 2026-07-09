using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Orders
{
    public class UpdateOrderStatusRequestDto
    {
        [Required]
        public int StatusId { get; set; }

        public string? CancelReason { get; set; }
    }
}
