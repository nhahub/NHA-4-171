using CarSparePartSysProject.Models.Dto.Orders;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDto>> GetAllAsync();

        Task<OrderDto?> GetByIdAsync(int id);

        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);

        Task<OrderDto> CreateAsync(CreateOrderRequestDto dto);

        Task CancelAsync(int orderId);
    }
}
