using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace CarSparePartSysProject.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception has occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;
            var message = "An internal server error occurred.";

            switch (exception)
            {
                case UnauthorizedAccessException unauthorizedEx:
                    code = HttpStatusCode.Unauthorized;
                    message = unauthorizedEx.Message;
                    break;
                case ArgumentException argumentEx:
                    code = HttpStatusCode.BadRequest;
                    message = argumentEx.Message;
                    break;
                case KeyNotFoundException keyNotFoundEx:
                    code = HttpStatusCode.NotFound;
                    message = keyNotFoundEx.Message;
                    break;
                case InvalidOperationException invalidOpEx:
                    code = HttpStatusCode.BadRequest;
                    message = invalidOpEx.Message;
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;

            var result = JsonSerializer.Serialize(new { message = message });
            return context.Response.WriteAsync(result);
        }
    }
}
