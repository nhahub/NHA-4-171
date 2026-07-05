using Microsoft.AspNetCore.Mvc;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.Models.Dto.PaymentMethods;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentMethodsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentMethodsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentMethodDto>>> GetAll()
        {
            var methods = await _context.PaymentMethods.AsNoTracking().ToListAsync();
            return Ok(methods.Select(pm => new PaymentMethodDto
            {
                PaymentMethodId = pm.PaymentMethodId,
                MethodName = pm.MethodName,
                IsActive = pm.IsActive
            }));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PaymentMethodDto>> GetById(int id)
        {
            var pm = await _context.PaymentMethods.FindAsync(id);
            if (pm == null)
            {
                return NotFound();
            }
            return Ok(new PaymentMethodDto
            {
                PaymentMethodId = pm.PaymentMethodId,
                MethodName = pm.MethodName,
                IsActive = pm.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<PaymentMethodDto>> Create(CreatePaymentMethodRequestDto dto)
        {
            var pm = new PaymentMethod
            {
                MethodName = dto.MethodName,
                IsActive = dto.IsActive
            };

            await _context.PaymentMethods.AddAsync(pm);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = pm.PaymentMethodId }, new PaymentMethodDto
            {
                PaymentMethodId = pm.PaymentMethodId,
                MethodName = pm.MethodName,
                IsActive = pm.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<PaymentMethodDto>> Update(int id, CreatePaymentMethodRequestDto dto)
        {
            var pm = await _context.PaymentMethods.FindAsync(id);
            if (pm == null)
            {
                return NotFound();
            }

            pm.MethodName = dto.MethodName ?? pm.MethodName;
            pm.IsActive = dto.IsActive;

            _context.PaymentMethods.Update(pm);
            await _context.SaveChangesAsync();

            return Ok(new PaymentMethodDto
            {
                PaymentMethodId = pm.PaymentMethodId,
                MethodName = pm.MethodName,
                IsActive = pm.IsActive
            });
        }
    }
}
