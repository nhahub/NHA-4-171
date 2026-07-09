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
    public class WarehousesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WarehousesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Warehouse>>> GetAll()
        {
            var warehouses = await _context.Warehouses.ToListAsync();
            return Ok(warehouses);
        }

        [HttpPost]
        public async Task<ActionResult<Warehouse>> Create(Warehouse warehouse)
        {
            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = warehouse.WarehouseId }, warehouse);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, Warehouse warehouse)
        {
            if (id != warehouse.WarehouseId)
            {
                return BadRequest("ID mismatch");
            }

            _context.Entry(warehouse).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Warehouses.AnyAsync(e => e.WarehouseId == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }
    }
}
