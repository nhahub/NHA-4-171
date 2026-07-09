using CarSparePartSysProject.Models.Dto.Payments;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentDto>> GetAllAsync();

        Task<PaymentDto?> GetByIdAsync(int id);

        Task<PaymentDto> CreateAsync(CreatePaymentRequestDto dto);

        Task UpdateStatusAsync(int paymentId, string status);
    }
}
