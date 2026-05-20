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

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskListItemDto>>> GetAll(CancellationToken ct) =>
        Ok(await _service.GetAllAsync(ct));

    [HttpPatch("{taskId:guid}/complete")]
    public async Task<ActionResult<TaskDto>> Complete(Guid taskId, CancellationToken ct) =>
        Ok(await _service.CompleteAsync(taskId, ct));

    [HttpPatch("{taskId:guid}/toggle")]
    public async Task<ActionResult<TaskDto>> Toggle(Guid taskId, CancellationToken ct) =>
        Ok(await _service.ToggleAsync(taskId, ct));

    [HttpDelete("{taskId:guid}")]
    public async Task<IActionResult> Delete(Guid taskId, CancellationToken ct)
    {
        await _service.DeleteAsync(taskId, ct);
        return NoContent();
    }
}
