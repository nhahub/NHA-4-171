using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Payments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;

        public PaymentService(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<IEnumerable<PaymentDto>> GetAllAsync()
        {
            var payments = await _paymentRepository.GetAllAsync();
            return payments.Select(p => new PaymentDto
            {
                PaymentId = p.PaymentId,
                OrderId = p.OrderId,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod != null ? p.PaymentMethod.MethodName : "Card",
                Status = p.Status,
                PaymentDate = p.PaymentDate,
                IsRefund = p.IsRefund
            });
        }

        public async Task<PaymentDto?> GetByIdAsync(int id)
        {
            var p = await _paymentRepository.GetByIdAsync(id);
            if (p == null) return null;
            return new PaymentDto
            {
                PaymentId = p.PaymentId,
                OrderId = p.OrderId,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod != null ? p.PaymentMethod.MethodName : "Card",
                Status = p.Status,
                PaymentDate = p.PaymentDate,
                IsRefund = p.IsRefund
            };
        }

        public async Task<PaymentDto> CreateAsync(CreatePaymentRequestDto dto)
        {
            var p = new Payment
            {
                OrderId = dto.OrderId,
                Amount = dto.Amount,
                PaymentMethodId = dto.PaymentMethodId,
                Status = "Pending",
                PaymentDate = DateTime.UtcNow,
                IsRefund = false
            };

            await _paymentRepository.AddAsync(p);
            await _paymentRepository.SaveAsync();

            return new PaymentDto
            {
                PaymentId = p.PaymentId,
                OrderId = p.OrderId,
                Amount = p.Amount,
                PaymentMethod = "Card",
                Status = p.Status,
                PaymentDate = p.PaymentDate,
                IsRefund = p.IsRefund
            };
        }

        public async Task UpdateStatusAsync(int paymentId, string status)
        {
            var p = await _paymentRepository.GetByIdAsync(paymentId);
            if (p != null)
            {
                p.Status = status;
                _paymentRepository.Update(p);
                await _paymentRepository.SaveAsync();
            }
        }
    }
}
