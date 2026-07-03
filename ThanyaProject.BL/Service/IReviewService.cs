using CarSparePartSysProject.Models.Dto.Reviews;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(int productId);

        Task<ReviewDto> AddAsync(CreateReviewRequestDto dto);

        Task<ReviewDto> UpdateAsync(int reviewId, UpdateReviewRequestDto dto);

        Task DeleteAsync(int reviewId);
    }
}