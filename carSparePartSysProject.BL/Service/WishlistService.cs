using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Wishlist;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using CarSparePartSysProject.Models.Dto.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepository;

        public WishlistService(IWishlistRepository wishlistRepository)
        {
            _wishlistRepository = wishlistRepository;
        }

        public async Task<IEnumerable<WishlistDto>> GetWishlistAsync(int userId)
        {
            var items = await _wishlistRepository.GetWishlistByUserIdAsync(userId);
            return items.Select(w => new WishlistDto
            {
                WishlistId = w.WishlistId,
                Product = new ProductSummaryDto
                {
                    ProductId = w.ProductId,
                    ProductName = w.Product?.ProductName ?? "Unknown Product",
                    UnitPrice = w.Product?.UnitPrice ?? 0,
                    ImageUrl = w.Product?.ImageUrl,
                    AverageRating = w.Product?.Reviews != null && w.Product.Reviews.Any() ? Math.Round(w.Product.Reviews.Average(r => (double)r.Rating), 1) : 0.0,
                    ReviewsCount = w.Product?.Reviews?.Count ?? 0
                },
                AddedAt = w.AddedAt
            }).ToList();
        }

        public async Task AddAsync(int userId, AddToWishlistRequestDto dto)
        {
            var items = await _wishlistRepository.GetWishlistByUserIdAsync(userId);
            if (items.Any(w => w.ProductId == dto.ProductId))
            {
                return; // Already exists in wishlist
            }

            var item = new Wishlist
            {
                UserId = userId,
                ProductId = dto.ProductId,
                AddedAt = DateTime.UtcNow
            };

            await _wishlistRepository.AddAsync(item);
            await _wishlistRepository.SaveAsync();
        }

        public async Task RemoveAsync(int wishlistId)
        {
            var item = await _wishlistRepository.GetByIdAsync(wishlistId);
            if (item != null)
            {
                _wishlistRepository.Delete(item);
                await _wishlistRepository.SaveAsync();
            }
        }
    }
}