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

        private OrderDto MapToDto(Order o)
        {
            var payment = o.Payments?.FirstOrDefault();
            var statusName = o.Status?.StatusName ?? "Pending";
            
            var details = o.OrderDetails?.Select(od => new OrderItemDto
            {
                ProductId = od.ProductId,
                ProductName = od.Product?.ProductName ?? "Product #" + od.ProductId,
                ImageUrl = od.Product?.ImageUrl,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                TotalPrice = od.LineTotal
            }).ToList() ?? new List<OrderItemDto>();

            var customer = o.Customer != null ? new CarSparePartSysProject.Models.Dto.Account.UserDto
            {
                UserId = o.Customer.Id,
                FirstName = o.Customer.FirstName,
                LastName = o.Customer.LastName,
                Username = o.Customer.UserName ?? string.Empty,
                Email = o.Customer.Email ?? string.Empty,
                Phone = o.Customer.PhoneNumber
            } : null;

            var shipping = o.Shipping != null ? new CarSparePartSysProject.Models.Dto.Shipping.ShippingDto
            {
                ShippingId = o.Shipping.ShippingId,
                OrderId = o.Shipping.OrderId,
                Carrier = o.Shipping.Carrier,
                TrackingNumber = o.Shipping.TrackingNumber,
                ShippingCost = o.Shipping.ShippingCost,
                Status = o.Shipping.Status,
                EstimatedDeliveryDate = o.Shipping.EstimatedDeliveryDate,
                ShippedAt = o.Shipping.ShippedAt,
                DeliveredAt = o.Shipping.DeliveredAt
            } : null;

            return new OrderDto
            {
                OrderId = o.OrderId,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                SubTotal = o.SubTotal,
                TaxAmount = o.TaxAmount,
                DiscountAmount = o.DiscountAmount,
                TotalAmount = o.TotalAmount,
                IsPaid = o.IsPaid,
                Status = statusName,
                StatusId = o.StatusId,
                StatusName = statusName,
                PaymentMethod = payment?.PaymentMethod?.MethodName ?? "Stripe",
                Customer = customer,
                OrderDetails = details,
                Items = details,
                Shipping = shipping,
                CancelReason = o.CancelReason
            };
        }

        public async Task<IEnumerable<OrderDto>> GetAllAsync()
        {
            var orders = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.Shipping)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
        }

        public async Task<OrderDetailsDto?> GetByIdAsync(int id)
        {
            var o = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.Shipping)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (o == null) return null;

            var dto = MapToDto(o);
            return new OrderDetailsDto
            {
                OrderId = dto.OrderId,
                OrderNumber = dto.OrderNumber,
                OrderDate = dto.OrderDate,
                SubTotal = dto.SubTotal,
                TaxAmount = dto.TaxAmount,
                DiscountAmount = dto.DiscountAmount,
                TotalAmount = dto.TotalAmount,
                IsPaid = dto.IsPaid,
                Status = dto.Status,
                StatusId = dto.StatusId,
                StatusName = dto.StatusName,
                PaymentMethod = dto.PaymentMethod,
                Customer = dto.Customer,
                OrderDetails = dto.OrderDetails,
                Items = dto.Items,
                Shipping = dto.Shipping
            };
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.Shipping)
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToDto).ToList();
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
                coupon = await Context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.CouponCode && c.IsActive && c.StartDate.Date <= DateTime.UtcNow.Date && c.EndDate.Date >= DateTime.UtcNow.Date);
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
                IsPaid = (dto.PaymentMethodId == 1 || dto.PaymentMethodId == 2),
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

            var savedOrder = await Context.Orders
                .Include(o => o.Status)
                .Include(o => o.Payments)
                    .ThenInclude(p => p.PaymentMethod)
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Include(o => o.Shipping)
                .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

            return MapToDto(savedOrder ?? order);
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