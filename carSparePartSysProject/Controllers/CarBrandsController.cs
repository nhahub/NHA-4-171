using Microsoft.AspNetCore.Mvc;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.Models.Dto.CarBrands;
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
    public class CarBrandsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarBrandsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarBrandDto>>> GetAll()
        {
            var brands = await _context.CarBrands.AsNoTracking().ToListAsync();
            return Ok(brands.Select(b => new CarBrandDto
            {
                BrandId = b.BrandId,
                BrandName = b.BrandName,
                Country = b.Country,
                LogoUrl = b.LogoUrl
            }));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CarBrandDto>> GetById(int id)
        {
            var b = await _context.CarBrands.FindAsync(id);
            if (b == null)
            {
                return NotFound();
            }
            return Ok(new CarBrandDto
            {
                BrandId = b.BrandId,
                BrandName = b.BrandName,
                Country = b.Country,
                LogoUrl = b.LogoUrl
            });
        }

        [HttpGet("{brandId:int}/models")]
        public async Task<ActionResult<IEnumerable<CarModelDto>>> GetModels(int brandId)
        {
            var models = await _context.CarModels
                .AsNoTracking()
                .Where(m => m.BrandId == brandId)
                .ToListAsync();

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

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CarBrandDto>> Create(CreateCarBrandRequestDto dto)
        {
            var b = new CarBrand
            {
                BrandName = dto.BrandName,
                Country = dto.Country,
                LogoUrl = dto.LogoUrl
            };

            await _context.CarBrands.AddAsync(b);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = b.BrandId }, new CarBrandDto
            {
                BrandId = b.BrandId,
                BrandName = b.BrandName,
                Country = b.Country,
                LogoUrl = b.LogoUrl
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<CarBrandDto>> Update(int id, UpdateCarBrandRequestDto dto)
        {
            var b = await _context.CarBrands.FindAsync(id);
            if (b == null)
            {
                return NotFound();
            }

            b.BrandName = dto.BrandName ?? b.BrandName;
            b.Country = dto.Country ?? b.Country;
            b.LogoUrl = dto.LogoUrl ?? b.LogoUrl;

            _context.CarBrands.Update(b);
            await _context.SaveChangesAsync();

            return Ok(new CarBrandDto
            {
                BrandId = b.BrandId,
                BrandName = b.BrandName,
                Country = b.Country,
                LogoUrl = b.LogoUrl
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var b = await _context.CarBrands.FindAsync(id);
            if (b == null)
            {
                return NotFound();
            }

            _context.CarBrands.Remove(b);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
