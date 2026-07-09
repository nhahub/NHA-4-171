using CarSparePartSys.Model;
using CarSparePartSysProject.Models.Dto.Orders;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDto>> GetAllAsync();

        Task<OrderDetailsDto?> GetByIdAsync(int id);

        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);

        Task<OrderDto> CreateAsync(int userId, CreateOrderRequestDto dto);

        Task CancelAsync(int orderId);

        Task<Order?> GetOrderWithDetailsAsync(int orderId);

        Task MarkOrderAsPaidAsync(int orderId);

        Task RecordStripePaymentAsync(int orderId, decimal amount);
    }
}
