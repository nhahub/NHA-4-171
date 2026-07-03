using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Shipping;

namespace CarSparePartSysProject.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;

        public ShippingController(IShippingService shippingService)
        {
            _shippingService = shippingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShippingDto>>> GetAll()
        {
            var shippingList = await _shippingService.GetAllAsync();
            return Ok(shippingList);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ShippingDto>> GetById(int id)
        {
            var shipping = await _shippingService.GetByIdAsync(id);
            if (shipping == null)
            {
                return NotFound();
            }
            return Ok(shipping);
        }

        [HttpPost]
        public async Task<ActionResult<ShippingDto>> Create(CreateShippingRequestDto dto)
        {
            var shipping = await _shippingService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = shipping.ShippingId }, shipping);
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            try
            {
                await _shippingService.UpdateStatusAsync(id, status);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
