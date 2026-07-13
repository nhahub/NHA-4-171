using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Coupons;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponsController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CouponDto>>> GetAll()
        {
            var coupons = await _couponService.GetAllAsync();
            return Ok(coupons);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CouponDto>> GetById(int id)
        {
            var coupon = await _couponService.GetByIdAsync(id);
            if (coupon == null)
            {
                return NotFound();
            }
            return Ok(coupon);
        }

        [HttpGet("code/{code}")]
        public async Task<ActionResult<CouponDto>> GetByCode(string code)
        {
            var coupon = await _couponService.GetByCodeAsync(code);
            if (coupon == null)
            {
                return NotFound();
            }
            return Ok(coupon);
        }

        [HttpPost]
        public async Task<ActionResult<CouponDto>> Create(CreateCouponRequestDto dto)
        {
            var coupon = await _couponService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = coupon.CouponId }, coupon);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CouponDto>> Update(int id, UpdateCouponRequestDto dto)
        {
            try
            {
                var coupon = await _couponService.UpdateAsync(id, dto);
                return Ok(coupon);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _couponService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost("validate")]
        public async Task<ActionResult<CouponDto>> Validate([FromBody] ValidateCouponRequestDto dto)
        {
            var coupon = await _couponService.GetByCodeAsync(dto.Code);
            if (coupon == null)
            {
                return BadRequest(new { message = "Invalid coupon code." });
            }

            if (!coupon.IsActive)
            {
                return BadRequest(new { message = "This coupon is currently inactive." });
            }

            if (coupon.StartDate.Date > DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "This coupon has not started yet." });
            }

            if (coupon.EndDate.Date < DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "This coupon has expired." });
            }

            if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
            {
                return BadRequest(new { message = "This coupon has reached its usage limit." });
            }

            return Ok(coupon);
        }
    }

    public class ValidateCouponRequestDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Code { get; set; } = string.Empty;
    }
}
