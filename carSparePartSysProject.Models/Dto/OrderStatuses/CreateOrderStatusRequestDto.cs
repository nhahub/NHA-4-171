using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.OrderStatuses
{
    public class CreateOrderStatusRequestDto
    {
        [Required]
        [MaxLength(50)]
        public string StatusName { get; set; } = string.Empty;
    }
}
