using Microsoft.AspNetCore.Mvc;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.Models.Dto.CarModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarModelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarModelsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarModelDto>>> GetAll()
        {
            var models = await _context.CarModels.AsNoTracking().ToListAsync();
            return Ok(models.Select(m => new CarModelDto
            {
                ModelId = m.ModelId,
                BrandId = m.BrandId,
                ModelName = m.ModelName,
                YearStart = m.YearStart,
                YearEnd = m.YearEnd,
                EngineType = m.EngineType
            }));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CarModelDto>> GetById(int id)
        {
            var m = await _context.CarModels.FindAsync(id);
            if (m == null)
            {
                return NotFound();
            }
            return Ok(new CarModelDto
            {
                ModelId = m.ModelId,
                BrandId = m.BrandId,
                ModelName = m.ModelName,
                YearStart = m.YearStart,
                YearEnd = m.YearEnd,
                EngineType = m.EngineType
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CarModelDto>> Create(CreateCarModelRequestDto dto)
        {
            var m = new CarModel
            {
                BrandId = dto.BrandId,
                ModelName = dto.ModelName,
                YearStart = (short)dto.YearStart,
                YearEnd = (short?)dto.YearEnd,
                EngineType = dto.EngineType
            };

            await _context.CarModels.AddAsync(m);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = m.ModelId }, new CarModelDto
            {
                ModelId = m.ModelId,
                BrandId = m.BrandId,
                ModelName = m.ModelName,
                YearStart = m.YearStart,
                YearEnd = m.YearEnd,
                EngineType = m.EngineType
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<CarModelDto>> Update(int id, UpdateCarModelRequestDto dto)
        {
            var m = await _context.CarModels.FindAsync(id);
            if (m == null)
            {
                return NotFound();
            }

            m.BrandId = dto.BrandId ?? m.BrandId;
            m.ModelName = dto.ModelName ?? m.ModelName;
            m.YearStart = (short)(dto.YearStart ?? m.YearStart);
            m.YearEnd = (short?)(dto.YearEnd ?? m.YearEnd);
            m.EngineType = dto.EngineType ?? m.EngineType;

            _context.CarModels.Update(m);
            await _context.SaveChangesAsync();

            return Ok(new CarModelDto
            {
                ModelId = m.ModelId,
                BrandId = m.BrandId,
                ModelName = m.ModelName,
                YearStart = m.YearStart,
                YearEnd = m.YearEnd,
                EngineType = m.EngineType
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var m = await _context.CarModels.FindAsync(id);
            if (m == null)
            {
                return NotFound();
            }

            _context.CarModels.Remove(m);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
