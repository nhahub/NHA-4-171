using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.PaymentMethods
{
    public class PaymentMethodDto
    {
        public int PaymentMethodId { get; set; }

        public string MethodName { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }

}
