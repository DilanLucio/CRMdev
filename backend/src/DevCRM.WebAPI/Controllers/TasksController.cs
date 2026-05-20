using DevCRM.Application.Tasks.Dtos;
using DevCRM.Application.Tasks.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;
    public TasksController(ITaskService service) => _service = service;

    [HttpPatch("{taskId:guid}/complete")]
    public async Task<ActionResult<TaskDto>> Complete(Guid taskId, CancellationToken ct) =>
        Ok(await _service.CompleteAsync(taskId, ct));
}
