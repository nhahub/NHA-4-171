using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Coupons;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class CouponService : ICouponService
    {
        private readonly ICouponRepository _couponRepository;

        public CouponService(ICouponRepository couponRepository)
        {
            _couponRepository = couponRepository;
        }

        public async Task<IEnumerable<CouponDto>> GetAllAsync()
        {
            var coupons = await _couponRepository.GetAllAsync();
            return coupons.Select(c => new CouponDto
            {
                CouponId = c.CouponId,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType.ToString(),
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive
            });
        }

        public async Task<CouponDto?> GetByIdAsync(int id)
        {
            var c = await _couponRepository.GetByIdAsync(id);
            if (c == null) return null;
            return new CouponDto
            {
                CouponId = c.CouponId,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType.ToString(),
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive
            };
        }

        public async Task<CouponDto?> GetByCodeAsync(string code)
        {
            var c = await _couponRepository.GetByCodeAsync(code);
            if (c == null) return null;
            return new CouponDto
            {
                CouponId = c.CouponId,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType.ToString(),
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive
            };
        }

        public async Task<CouponDto> CreateAsync(CreateCouponRequestDto dto)
        {
            var c = new Coupon
            {
                Code = dto.Code,
                Description = dto.Description,
                DiscountType = dto.DiscountType == "Percentage" ? DiscountType.Percentage : DiscountType.FixedAmount,
                DiscountValue = dto.DiscountValue,
                MinOrderAmount = dto.MinOrderAmount,
                MaxDiscountAmount = dto.MaxDiscountAmount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive
            };

            await _couponRepository.AddAsync(c);
            await _couponRepository.SaveAsync();

            return new CouponDto
            {
                CouponId = c.CouponId,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType.ToString(),
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive
            };
        }

        public async Task<CouponDto> UpdateAsync(int id, UpdateCouponRequestDto dto)
        {
            var c = await _couponRepository.GetByIdAsync(id);
            if (c == null)
            {
                throw new KeyNotFoundException("Coupon not found.");
            }

            c.Code = dto.Code ?? c.Code;
            c.Description = dto.Description ?? c.Description;
            if (dto.DiscountType != null)
            {
                c.DiscountType = dto.DiscountType == "Percentage" ? DiscountType.Percentage : DiscountType.FixedAmount;
            }
            c.DiscountValue = dto.DiscountValue ?? c.DiscountValue;
            c.MinOrderAmount = dto.MinOrderAmount ?? c.MinOrderAmount;
            c.MaxDiscountAmount = dto.MaxDiscountAmount ?? c.MaxDiscountAmount;
            c.StartDate = dto.StartDate ?? c.StartDate;
            c.EndDate = dto.EndDate ?? c.EndDate;
            c.IsActive = dto.IsActive ?? c.IsActive;

            _couponRepository.Update(c);
            await _couponRepository.SaveAsync();

            return new CouponDto
            {
                CouponId = c.CouponId,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType.ToString(),
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxDiscountAmount = c.MaxDiscountAmount,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                IsActive = c.IsActive
            };
        }

        public async Task DeleteAsync(int id)
        {
            var c = await _couponRepository.GetByIdAsync(id);
            if (c != null)
            {
                _couponRepository.Delete(c);
                await _couponRepository.SaveAsync();
            }
        }
    }
}
