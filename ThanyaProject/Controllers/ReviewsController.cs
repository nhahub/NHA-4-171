using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Reviews;

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
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(int productId)
        {
            var reviews = await _reviewService.GetProductReviewsAsync(productId);
            return Ok(reviews);
        }

        [HttpPost]
        public async Task<ActionResult<ReviewDto>> Create(CreateReviewRequestDto dto)
        {
            var review = await _reviewService.AddAsync(dto);
            return CreatedAtAction(nameof(GetProductReviews), new { productId = review.ProductId }, review);
        }

        [HttpPut("{id:int}")]
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
