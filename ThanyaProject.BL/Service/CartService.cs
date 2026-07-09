using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Cart;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using CarSparePartSysProject.Models.Dto.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class CartService : ICartService
    {
        private static readonly System.Threading.SemaphoreSlim _cartLock = new(1, 1);

        private readonly ICartRepository _cartRepository;
        private readonly IRepository<CartItem> _cartItemRepository;
        private readonly IRepository<Product> _productRepository;

        public CartService(
            ICartRepository cartRepository,
            IRepository<CartItem> cartItemRepository,
            IRepository<Product> productRepository)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
        }

        public async Task<CartDto?> GetUserCartAsync(int userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                await _cartLock.WaitAsync();
                try
                {
                    cart = await _cartRepository.GetCartByUserIdAsync(userId);
                    if (cart == null)
                    {
                        cart = new Cart { UserId = userId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                        await _cartRepository.AddAsync(cart);
                        await _cartRepository.SaveAsync();
                    }
                }
                finally
                {
                    _cartLock.Release();
                }
            }

            var cartItemDtos = cart.CartItems.Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemId,
                ProductId = ci.ProductId,
                Product = new ProductSummaryDto
                {
                    ProductId = ci.ProductId,
                    ProductName = ci.Product?.ProductName ?? "Unknown Product",
                    UnitPrice = ci.Product?.UnitPrice ?? 0,
                    ImageUrl = ci.Product?.ImageUrl
                },
                Quantity = ci.Quantity,
                UnitPrice = ci.Product?.UnitPrice ?? 0,
                TotalPrice = (ci.Product?.UnitPrice ?? 0) * ci.Quantity
            }).ToList();

            return new CartDto
            {
                CartId = cart.CartId,
                Items = cartItemDtos,
                TotalItems = cartItemDtos.Sum(x => x.Quantity),
                TotalPrice = cartItemDtos.Sum(x => x.TotalPrice)
            };
        }

        public async Task AddToCartAsync(int userId, AddToCartRequestDto dto)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                await _cartLock.WaitAsync();
                try
                {
                    cart = await _cartRepository.GetCartByUserIdAsync(userId);
                    if (cart == null)
                    {
                        cart = new Cart { UserId = userId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                        await _cartRepository.AddAsync(cart);
                        await _cartRepository.SaveAsync();
                    }
                }
                finally
                {
                    _cartLock.Release();
                }
            }

            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);
            if (cartItem != null)
            {
                cartItem.Quantity += dto.Quantity;
                _cartItemRepository.Update(cartItem);
            }
            else
            {
                cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    AddedAt = DateTime.UtcNow
                };
                await _cartItemRepository.AddAsync(cartItem);
            }
            await _cartRepository.SaveAsync();
        }

        public async Task UpdateQuantityAsync(UpdateCartItemRequesDtot dto)
        {
            var item = await _cartItemRepository.GetByIdAsync(dto.CartItemId);
            if (item != null)
            {
                item.Quantity = dto.Quantity;
                _cartItemRepository.Update(item);
                await _cartItemRepository.SaveAsync();
            }
        }

        public async Task RemoveItemAsync(int cartItemId)
        {
            var item = await _cartItemRepository.GetByIdAsync(cartItemId);
            if (item != null)
            {
                _cartItemRepository.Delete(item);
                await _cartItemRepository.SaveAsync();
            }
        }

        public async Task ClearCartAsync(int userId)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);
            if (cart != null)
            {
                foreach (var item in cart.CartItems.ToList())
                {
                    _cartItemRepository.Delete(item);
                }
                await _cartRepository.SaveAsync();
            }
        }
    }
}
