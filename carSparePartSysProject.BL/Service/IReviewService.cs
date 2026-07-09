using CarSparePartSysProject.Models.Dto.Reviews;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(int productId);

        Task<IEnumerable<ReviewDto>> GetUserReviewsAsync(int userId);

        Task<ReviewDto> AddAsync(int userId, CreateReviewRequestDto dto);

        Task<ReviewDto> UpdateAsync(int reviewId, UpdateReviewRequestDto dto);

        Task DeleteAsync(int reviewId);

        Task<IEnumerable<ReviewDto>> GetAllReviewsAsync();

        Task<ReviewDto> ToggleVerifyAsync(int reviewId);
    }
}