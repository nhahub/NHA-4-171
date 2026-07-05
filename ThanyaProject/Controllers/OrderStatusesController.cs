using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSys.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderStatusesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderStatusesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderStatus>>> GetAll()
        {
            var statuses = await _context.OrderStatuses.ToListAsync();
            return Ok(statuses);
        }

        [HttpPost]
        public async Task<ActionResult<OrderStatus>> Create(OrderStatus status)
        {
            _context.OrderStatuses.Add(status);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = status.StatusId }, status);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, OrderStatus status)
        {
            if (id != status.StatusId)
            {
                return BadRequest("ID mismatch");
            }

            _context.Entry(status).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.OrderStatuses.AnyAsync(e => e.StatusId == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }
    }
}
