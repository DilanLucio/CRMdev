using DevCRM.Application.GitHub;
using DevCRM.Application.Projects.Dtos;
using DevCRM.Application.Projects.Services;
using DevCRM.Application.Tasks.Dtos;
using DevCRM.Application.Tasks.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projects;
    private readonly ITaskService _tasks;
    private readonly IGitHubReadmeService _github;

    public ProjectsController(IProjectService projects, ITaskService tasks, IGitHubReadmeService github)
    {
        _projects = projects;
        _tasks = tasks;
        _github = github;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectListItemDto>>> GetAll(CancellationToken ct) =>
        Ok(await _projects.GetAllAsync(ct));

    [HttpGet("inactive")]
    public async Task<ActionResult<IReadOnlyList<ProjectListItemDto>>> GetAllInactive(CancellationToken ct) =>
        Ok(await _projects.GetAllInactiveAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDetailsDto>> GetById(Guid id, CancellationToken ct)
    {
        var project = await _projects.GetByIdAsync(id, ct);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDetailsDto>> Create([FromBody] CreateProjectDto dto, CancellationToken ct)
    {
        var created = await _projects.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProjectDetailsDto>> Update(Guid id, [FromBody] UpdateProjectDto dto, CancellationToken ct) =>
        Ok(await _projects.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await _projects.DeactivateAsync(id, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _projects.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/with-client")]
    public async Task<IActionResult> DeleteWithClient(Guid id, CancellationToken ct)
    {
        await _projects.DeleteWithClientAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/tasks")]
    public async Task<ActionResult<TaskDto>> AddTask(Guid id, [FromBody] CreateTaskDto dto, CancellationToken ct) =>
        Ok(await _tasks.AddToProjectAsync(id, dto, ct));

    [HttpGet("{id:guid}/readme")]
    public async Task<ActionResult<ReadmeResponse>> GetReadme(Guid id, CancellationToken ct)
    {
        var project = await _projects.GetByIdAsync(id, ct);
        if (project is null) return NotFound();
        if (string.IsNullOrWhiteSpace(project.GitHubRepoUrl))
            return Ok(new ReadmeResponse(null, "No GitHub repo configured for this project."));

        var markdown = await _github.GetReadmeAsync(project.GitHubRepoUrl, ct);
        return markdown is null
            ? Ok(new ReadmeResponse(null, "README not found on GitHub."))
            : Ok(new ReadmeResponse(markdown, null));
    }
}

public record ReadmeResponse(string? Markdown, string? Message);
