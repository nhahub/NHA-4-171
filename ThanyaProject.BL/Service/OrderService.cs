using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Orders;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly AppDbContext? _context;

        public OrderService(IOrderRepository orderRepository, IPaymentRepository paymentRepository, AppDbContext? context = null)
        {
            _orderRepository = orderRepository;
            _paymentRepository = paymentRepository;
            _context = context;
        }

        private AppDbContext Context => _context ?? throw new InvalidOperationException("DbContext is not initialized.");

        public async Task<IEnumerable<OrderDto>> GetAllAsync()
        {
            var orders = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status?.StatusName ?? "Pending",
                PaymentMethod = o.Payments?.FirstOrDefault()?.PaymentMethod?.MethodName ?? "Stripe"
            }).ToList();
        }

        public async Task<OrderDetailsDto?> GetByIdAsync(int id)
        {
            var o = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (o == null) return null;

            return new OrderDetailsDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status?.StatusName ?? "Pending",
                PaymentMethod = o.Payments?.FirstOrDefault()?.PaymentMethod?.MethodName ?? "Stripe",
                Items = o.OrderDetails.Select(od => new OrderItemDto
                {
                    ProductId = od.ProductId,
                    ProductName = od.Product?.ProductName ?? "Unknown Product",
                    ImageUrl = od.Product?.ImageUrl,
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    TotalPrice = od.LineTotal
                }).ToList()
            };
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status?.StatusName ?? "Pending",
                PaymentMethod = o.Payments?.FirstOrDefault()?.PaymentMethod?.MethodName ?? "Stripe"
            }).ToList();
        }

        public async Task<OrderDto> CreateAsync(int userId, CreateOrderRequestDto dto)
        {
            var cart = await Context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new InvalidOperationException("Your cart is empty.");
            }

            decimal subtotal = cart.CartItems.Sum(ci => (ci.Product?.UnitPrice ?? 0) * ci.Quantity);
            decimal discountAmount = 0;
            Coupon? coupon = null;

            if (!string.IsNullOrEmpty(dto.CouponCode))
            {
                coupon = await Context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.CouponCode && c.IsActive && c.StartDate <= DateTime.UtcNow && c.EndDate >= DateTime.UtcNow);
                if (coupon != null)
                {
                    if (coupon.MinOrderAmount == null || subtotal >= coupon.MinOrderAmount.Value)
                    {
                        if (coupon.DiscountType == DiscountType.Percentage)
                        {
                            discountAmount = subtotal * (coupon.DiscountValue / 100);
                        }
                        else
                        {
                            discountAmount = coupon.DiscountValue;
                        }

                        if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                        {
                            discountAmount = coupon.MaxDiscountAmount.Value;
                        }

                        coupon.UsedCount++;
                        Context.Coupons.Update(coupon);
                    }
                }
            }

            decimal taxRate = 10; // 10%
            decimal taxAmount = (subtotal - discountAmount) * (taxRate / 100);
            decimal totalAmount = subtotal - discountAmount + taxAmount;

            var order = new Order
            {
                OrderNumber = "ORD-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                OrderDate = DateTime.UtcNow,
                SubTotal = subtotal,
                TaxAmount = taxAmount,
                DiscountAmount = discountAmount,
                TotalAmount = totalAmount,
                IsPaid = false,
                CustomerId = userId,
                StatusId = 1, // Pending
                ShippingAddressId = dto.AddressId,
                CouponId = coupon?.CouponId
            };

            await Context.Orders.AddAsync(order);
            await Context.SaveChangesAsync();

            foreach (var item in cart.CartItems)
            {
                var detail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product?.UnitPrice ?? 0,
                    Discount = 0,
                    LineTotal = (item.Product?.UnitPrice ?? 0) * item.Quantity
                };
                await Context.OrderDetails.AddAsync(detail);
            }

            // Clear cart
            foreach (var item in cart.CartItems)
            {
                Context.CartItems.Remove(item);
            }
            await Context.SaveChangesAsync();

            return new OrderDto
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = "Pending",
                PaymentMethod = "Stripe"
            };
        }

        public async Task CancelAsync(int orderId)
        {
            var order = await Context.Orders.Include(o => o.Status).FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
            {
                throw new KeyNotFoundException("Order not found.");
            }

            var cancelledStatus = await Context.OrderStatuses.FirstOrDefaultAsync(s => s.StatusName == "Cancelled");
            if (cancelledStatus == null)
            {
                cancelledStatus = new OrderStatus { StatusName = "Cancelled" };
                await Context.OrderStatuses.AddAsync(cancelledStatus);
                await Context.SaveChangesAsync();
            }

            order.StatusId = cancelledStatus.StatusId;
            Context.Orders.Update(order);
            await Context.SaveChangesAsync();
        }

        public async Task<Order?> GetOrderWithDetailsAsync(int orderId)
        {
            return await _orderRepository.GetOrderWithDetailsAsync(orderId);
        }

        public async Task MarkOrderAsPaidAsync(int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order != null && !order.IsPaid)
            {
                order.IsPaid = true;
                _orderRepository.Update(order);
                await _orderRepository.SaveAsync();
            }
        }

        public async Task RecordStripePaymentAsync(int orderId, decimal amount)
        {
            var payment = new Payment
            {
                OrderId = orderId,
                Amount = amount,
                PaymentMethodId = 1,
                Status = "Succeeded",
                PaymentDate = DateTime.UtcNow
            };
            await _paymentRepository.AddAsync(payment);
            await _paymentRepository.SaveAsync();
        }
    }
}