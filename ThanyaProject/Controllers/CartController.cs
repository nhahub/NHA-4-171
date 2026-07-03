using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Cart;

namespace CarSparePartSysProject.Controllers
{
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
            await _cartService.AddToCartAsync(dto);
            return Ok();
        }

        [HttpPut("update-quantity")]
        public async Task<IActionResult> UpdateQuantity(UpdateCartItemRequesDtot dto)
        {
            await _cartService.UpdateQuantityAsync(dto);
            return NoContent();
        }

        [HttpDelete("items/{cartItemId:int}")]
        public async Task<IActionResult> RemoveItem(int cartItemId)
        {
            await _cartService.RemoveItemAsync(cartItemId);
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
