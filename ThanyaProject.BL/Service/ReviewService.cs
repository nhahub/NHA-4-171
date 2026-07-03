using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Reviews;
using CarSparePartSysProject.DAL.Repositories.Interfaces;

namespace CarSparePartSysProject.BL.Service
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewService(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        public Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(int productId)
        {
            throw new NotImplementedException();
        }

        public Task<ReviewDto> AddAsync(CreateReviewRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task<ReviewDto> UpdateAsync(int reviewId, UpdateReviewRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(int reviewId)
        {
            throw new NotImplementedException();
        }
    }
}