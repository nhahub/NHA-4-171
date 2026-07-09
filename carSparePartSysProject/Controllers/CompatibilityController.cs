using Microsoft.AspNetCore.Mvc;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.Models.Dto.Compatibility;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompatibilityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompatibilityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartCompatibility>>> GetAll()
        {
            var compatibilities = await _context.PartCompatibilities
                .Include(c => c.Product)
                .Include(c => c.CarModel)
                    .ThenInclude(m => m.Brand)
                .AsNoTracking()
                .ToListAsync();

            return Ok(compatibilities);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateCompatibilityRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var productExists = await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId);
            var modelExists = await _context.CarModels.AnyAsync(m => m.ModelId == dto.ModelId);

            if (!productExists || !modelExists)
            {
                return BadRequest("Invalid Product or Car Model ID.");
            }

            // Check if already exists
            var existing = await _context.PartCompatibilities
                .FirstOrDefaultAsync(c => c.ProductId == dto.ProductId && c.ModelId == dto.ModelId);

            if (existing != null)
            {
                return BadRequest("This compatibility mapping already exists.");
            }

            var compatibility = new PartCompatibility
            {
                ProductId = dto.ProductId,
                ModelId = dto.ModelId,
                Notes = dto.Notes
            };

            await _context.PartCompatibilities.AddAsync(compatibility);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = compatibility.CompatibilityId }, compatibility);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var compatibility = await _context.PartCompatibilities.FindAsync(id);
            if (compatibility == null)
            {
                return NotFound();
            }

            _context.PartCompatibilities.Remove(compatibility);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
