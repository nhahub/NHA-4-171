using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Shipping;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class ShippingService : IShippingService
    {
        private readonly IShippingRepository _shippingRepository;

        public ShippingService(IShippingRepository shippingRepository)
        {
            _shippingRepository = shippingRepository;
        }

        public async Task<IEnumerable<ShippingDto>> GetAllAsync()
        {
            var items = await _shippingRepository.GetAllAsync();
            return items.Select(s => new ShippingDto
            {
                ShippingId = s.ShippingId,
                OrderId = s.OrderId,
                Carrier = s.Carrier,
                TrackingNumber = s.TrackingNumber,
                ShippingCost = s.ShippingCost,
                EstimatedDeliveryDate = s.EstimatedDeliveryDate,
                ShippedAt = s.ShippedAt,
                DeliveredAt = s.DeliveredAt,
                Status = s.Status
            });
        }

        public async Task<ShippingDto?> GetByIdAsync(int id)
        {
            var s = await _shippingRepository.GetByIdAsync(id);
            if (s == null) return null;
            return new ShippingDto
            {
                ShippingId = s.ShippingId,
                OrderId = s.OrderId,
                Carrier = s.Carrier,
                TrackingNumber = s.TrackingNumber,
                ShippingCost = s.ShippingCost,
                EstimatedDeliveryDate = s.EstimatedDeliveryDate,
                ShippedAt = s.ShippedAt,
                DeliveredAt = s.DeliveredAt,
                Status = s.Status
            };
        }

        public async Task<ShippingDto> CreateAsync(CreateShippingRequestDto dto)
        {
            var s = new Shipping
            {
                OrderId = dto.OrderId,
                Carrier = dto.Carrier,
                TrackingNumber = dto.TrackingNumber,
                ShippingCost = dto.ShippingCost,
                EstimatedDeliveryDate = dto.EstimatedDeliveryDate,
                Status = dto.Status ?? "Pending"
            };

            await _shippingRepository.AddAsync(s);
            await _shippingRepository.SaveAsync();

            return new ShippingDto
            {
                ShippingId = s.ShippingId,
                OrderId = s.OrderId,
                Carrier = s.Carrier,
                TrackingNumber = s.TrackingNumber,
                ShippingCost = s.ShippingCost,
                EstimatedDeliveryDate = s.EstimatedDeliveryDate,
                ShippedAt = s.ShippedAt,
                DeliveredAt = s.DeliveredAt,
                Status = s.Status
            };
        }

        public async Task UpdateStatusAsync(int shippingId, string status)
        {
            var s = await _shippingRepository.GetByIdAsync(shippingId);
            if (s != null)
            {
                s.Status = status;
                if (status.Equals("Shipped", StringComparison.OrdinalIgnoreCase))
                {
                    s.ShippedAt = DateTime.UtcNow;
                }
                else if (status.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
                {
                    s.DeliveredAt = DateTime.UtcNow;
                }
                _shippingRepository.Update(s);
                await _shippingRepository.SaveAsync();
            }
        }
    }
}
