using CarSparePartSys.Model;
using CarSparePartSysProject.BL.Service;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Orders;
using FluentAssertions;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace CarSparePartSys.Tests
{
    public class OrderTests
    {
        private readonly Mock<IOrderRepository> _orderRepositoryMock;
        private readonly Mock<IPaymentRepository> _paymentRepositoryMock;
        private readonly OrderService _orderService;

        public OrderTests()
        {
            _orderRepositoryMock = new Mock<IOrderRepository>();
            _paymentRepositoryMock = new Mock<IPaymentRepository>();
            _orderService = new OrderService(_orderRepositoryMock.Object, _paymentRepositoryMock.Object);
        }

        [Fact]
        public async Task GetOrderWithDetailsAsync_ValidOrderId_ReturnsOrder()
        {
            // Arrange
            var orderId = 123;
            var expectedOrder = new Order { OrderId = orderId, OrderNumber = "ORD-12345" };
            _orderRepositoryMock.Setup(r => r.GetOrderWithDetailsAsync(orderId)).ReturnsAsync(expectedOrder);

            // Act
            var result = await _orderService.GetOrderWithDetailsAsync(orderId);

            // Assert
            result.Should().NotBeNull();
            result.OrderId.Should().Be(orderId);
            result.OrderNumber.Should().Be("ORD-12345");
        }

        [Fact]
        public async Task MarkOrderAsPaidAsync_UnpaidOrder_SetsPaidTrue()
        {
            // Arrange
            var orderId = 123;
            var expectedOrder = new Order { OrderId = orderId, IsPaid = false };
            _orderRepositoryMock.Setup(r => r.GetByIdAsync(orderId)).ReturnsAsync(expectedOrder);
            _orderRepositoryMock.Setup(r => r.Update(expectedOrder));
            _orderRepositoryMock.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

            // Act
            await _orderService.MarkOrderAsPaidAsync(orderId);

            // Assert
            expectedOrder.IsPaid.Should().BeTrue();
            _orderRepositoryMock.Verify(r => r.Update(expectedOrder), Times.Once);
            _orderRepositoryMock.Verify(r => r.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task RecordStripePaymentAsync_CreatesPaymentRecord()
        {
            // Arrange
            var orderId = 123;
            var amount = 99.99m;
            _paymentRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Payment>())).Returns(Task.CompletedTask);
            _paymentRepositoryMock.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

            // Act
            await _orderService.RecordStripePaymentAsync(orderId, amount);

            // Assert
            _paymentRepositoryMock.Verify(r => r.AddAsync(It.Is<Payment>(p => p.OrderId == orderId && p.Amount == amount && p.Status == "Succeeded")), Times.Once);
            _paymentRepositoryMock.Verify(r => r.SaveAsync(), Times.Once);
        }
    }
}
