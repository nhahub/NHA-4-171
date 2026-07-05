using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Reviews;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("product/{productId:int}")]
        [HttpGet("/api/products/{productId:int}/reviews")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(int productId)
        {
            var reviews = await _reviewService.GetProductReviewsAsync(productId);
            return Ok(reviews);
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetMyReviews()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var reviews = await _reviewService.GetUserReviewsAsync(userId);
            return Ok(reviews);
        }

        [HttpPost]
        [HttpPost("/api/products/{productId:int}/reviews")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> Create([FromRoute] int? productId, [FromBody] CreateReviewRequestDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            if (productId.HasValue)
            {
                dto.ProductId = productId.Value;
            }

            var review = await _reviewService.AddAsync(userId, dto);
            return CreatedAtAction(nameof(GetProductReviews), new { productId = review.ProductId }, review);
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> Update(int id, UpdateReviewRequestDto dto)
        {
            try
            {
                var review = await _reviewService.UpdateAsync(id, dto);
                return Ok(review);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _reviewService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
