using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Cart;
using System.Security.Claims;

namespace CarSparePartSysProject.Controllers
{
    public class UpdateCartItemQuantityDto
    {
        public int Quantity { get; set; }
    }

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // --- Frontend-specific endpoints ---

        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.GetUserCartAsync(userId);
            if (cart == null)
            {
                return NotFound();
            }
            return Ok(cart);
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem(AddToCartRequestDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            await _cartService.AddToCartAsync(userId, dto);
            return Ok();
        }

        [HttpPut("items/{cartItemId:int}")]
        public async Task<IActionResult> UpdateItemQuantity(int cartItemId, UpdateCartItemQuantityDto dto)
        {
            var updateDto = new UpdateCartItemRequesDtot
            {
                CartItemId = cartItemId,
                Quantity = dto.Quantity
            };
            await _cartService.UpdateQuantityAsync(updateDto);
            return NoContent();
        }

        [HttpDelete("items/{cartItemId:int}")]
        public async Task<IActionResult> RemoveItem(int cartItemId)
        {
            await _cartService.RemoveItemAsync(cartItemId);
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearUserCart()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            await _cartService.ClearCartAsync(userId);
            return NoContent();
        }

        // --- Original endpoints (retained for backward compatibility) ---

        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<CartDto>> GetUserCart(int userId)
        {
            var cart = await _cartService.GetUserCartAsync(userId);
            if (cart == null)
            {
                return NotFound();
            }
            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(AddToCartRequestDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }
            await _cartService.AddToCartAsync(userId, dto);
            return Ok();
        }

        [HttpPut("update-quantity")]
        public async Task<IActionResult> UpdateQuantity(UpdateCartItemRequesDtot dto)
        {
            await _cartService.UpdateQuantityAsync(dto);
            return NoContent();
        }

        [HttpDelete("clear/{userId:int}")]
        public async Task<IActionResult> ClearCart(int userId)
        {
            await _cartService.ClearCartAsync(userId);
            return NoContent();
        }
    }
}
