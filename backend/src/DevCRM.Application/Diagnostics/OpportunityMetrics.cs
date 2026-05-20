using System.Diagnostics.Metrics;

namespace DevCRM.Application.Diagnostics;

public sealed class OpportunityMetrics : IDisposable
{
    private readonly Meter _meter = new("DevCRM.Opportunities", "1.0.0");
    private readonly Counter<long> _ingestedTotal;
    private readonly Counter<long> _statusChangedTotal;
    private readonly Histogram<double> _ingestDurationMs;

    public OpportunityMetrics()
    {
        _ingestedTotal      = _meter.CreateCounter<long>("opportunities_ingested_total",       description: "Total opportunities ingested by agent");
        _statusChangedTotal = _meter.CreateCounter<long>("opportunities_status_changed_total",  description: "Total opportunity status transitions");
        _ingestDurationMs   = _meter.CreateHistogram<double>("opportunities_ingest_duration_ms", unit: "ms", description: "Ingest operation latency");
    }

    public void RecordIngested(string status) =>
        _ingestedTotal.Add(1, new KeyValuePair<string, object?>("status", status));

    public void RecordStatusChanged(string from, string to) =>
        _statusChangedTotal.Add(1,
            new KeyValuePair<string, object?>("from", from),
            new KeyValuePair<string, object?>("to", to));

    public void RecordIngestDuration(double ms) =>
        _ingestDurationMs.Record(ms);

    public void Dispose() => _meter.Dispose();
}
