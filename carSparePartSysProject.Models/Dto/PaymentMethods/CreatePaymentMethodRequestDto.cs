using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.PaymentMethods
{
    public class CreatePaymentMethodRequestDto
    {
        [Required]
        [MaxLength(50)]
        public string MethodName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
