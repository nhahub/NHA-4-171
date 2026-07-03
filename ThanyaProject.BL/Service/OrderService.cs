using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Orders;
using CarSparePartSysProject.DAL.Repositories.Interfaces;

namespace CarSparePartSysProject.BL.Service
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;

        public OrderService(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public Task<IEnumerable<OrderDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<OrderDto?> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<OrderDto> CreateAsync(CreateOrderRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task CancelAsync(int orderId)
        {
            throw new NotImplementedException();
        }
    }
}