using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Reviews;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly AppDbContext _context;

        public ReviewService(IReviewRepository reviewRepository, AppDbContext context)
        {
            _reviewRepository = reviewRepository;
            _context = context;
        }

        public async Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(int productId)
        {
            var reviews = await _reviewRepository.GetReviewsByProductIdAsync(productId);
            return reviews.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                ProductId = r.ProductId,
                ProductName = r.Product?.ProductName ?? "Unknown Product",
                UserId = r.UserId,
                CustomerName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}".Trim() : "Anonymous",
                Rating = r.Rating,
                Comment = r.Comment,
                IsVerified = r.IsVerified,
                CreatedAt = r.CreatedAt
            }).ToList();
        }

        public async Task<ReviewDto> AddAsync(int userId, CreateReviewRequestDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found.");
            }

            // Check if user already reviewed this product to prevent duplicate reviews (constrained by unique index)
            var existing = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == dto.ProductId);
            if (existing != null)
            {
                // Update existing instead or throw
                existing.Rating = (byte)dto.Rating;
                existing.Comment = dto.Comment;
                existing.CreatedAt = DateTime.UtcNow;
                _context.Reviews.Update(existing);
                await _context.SaveChangesAsync();

                return new ReviewDto
                {
                    ReviewId = existing.ReviewId,
                    ProductId = existing.ProductId,
                    ProductName = product.ProductName,
                    UserId = userId,
                    CustomerName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Anonymous",
                    Rating = existing.Rating,
                    Comment = existing.Comment,
                    IsVerified = existing.IsVerified,
                    CreatedAt = existing.CreatedAt
                };
            }

            var review = new Review
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = (byte)dto.Rating,
                Comment = dto.Comment,
                IsVerified = true, // Set to verified
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveAsync();

            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                ProductId = review.ProductId,
                ProductName = product.ProductName,
                UserId = userId,
                CustomerName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Anonymous",
                Rating = review.Rating,
                Comment = review.Comment,
                IsVerified = review.IsVerified,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<ReviewDto> UpdateAsync(int reviewId, UpdateReviewRequestDto dto)
        {
            var review = await _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);

            if (review == null)
            {
                throw new KeyNotFoundException("Review not found.");
            }

            review.Rating = (byte)(dto.Rating ?? review.Rating);
            review.Comment = dto.Comment ?? review.Comment;
            review.CreatedAt = DateTime.UtcNow;

            _reviewRepository.Update(review);
            await _reviewRepository.SaveAsync();

            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                ProductId = review.ProductId,
                ProductName = review.Product?.ProductName ?? "",
                UserId = review.UserId,
                CustomerName = review.User != null ? $"{review.User.FirstName} {review.User.LastName}".Trim() : "Anonymous",
                Rating = review.Rating,
                Comment = review.Comment,
                IsVerified = review.IsVerified,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task DeleteAsync(int reviewId)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review != null)
            {
                _reviewRepository.Delete(review);
                await _reviewRepository.SaveAsync();
            }
        }

        public async Task<IEnumerable<ReviewDto>> GetUserReviewsAsync(int userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .ToListAsync();

            return reviews.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                ProductId = r.ProductId,
                ProductName = r.Product?.ProductName ?? "Unknown Product",
                UserId = r.UserId,
                CustomerName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}".Trim() : "Anonymous",
                Rating = r.Rating,
                Comment = r.Comment,
                IsVerified = r.IsVerified,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
    }
}