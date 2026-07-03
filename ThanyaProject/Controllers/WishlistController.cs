using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Wishlist;

namespace CarSparePartSysProject.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<IEnumerable<WishlistDto>>> GetWishlist(int userId)
        {
            var wishlist = await _wishlistService.GetWishlistAsync(userId);
            return Ok(wishlist);
        }

        [HttpPost]
        public async Task<IActionResult> Add(AddToWishlistRequestDto dto)
        {
            await _wishlistService.AddAsync(dto);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Remove(int id)
        {
            await _wishlistService.RemoveAsync(id);
            return NoContent();
        }
    }
}
