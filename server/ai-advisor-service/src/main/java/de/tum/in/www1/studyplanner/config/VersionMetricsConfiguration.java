package de.tum.in.www1.studyplanner.config;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Component that exposes application version and build information as Prometheus metrics.
 * This enables tracking which version is deployed and correlating performance changes with releases.
 */
@Component
public class VersionMetricsConfiguration {

    private final MeterRegistry meterRegistry;
    
    @Value("${spring.application.name:unknown}")
    private String applicationName;
    
    @Value("${application.version:unknown}")
    private String applicationVersion;
    
    @Value("${build.timestamp:unknown}")
    private String buildTimestamp;
    
    @Value("${git.commit.id.abbrev:unknown}")
    private String gitCommitId;

    public VersionMetricsConfiguration(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void registerVersionMetrics() {
        // Application version info metric
        Gauge.builder("application_info", () -> 1.0)
                .description("Application version and build information")
                .tag("name", applicationName)
                .tag("version", applicationVersion)
                .tag("build_timestamp", buildTimestamp)
                .tag("git_commit", gitCommitId)
                .register(meterRegistry);

        // Build timestamp as metric for easy querying
        try {
            long buildTimestampSeconds = Instant.parse(buildTimestamp + "T00:00:00Z").getEpochSecond();
            Gauge.builder("application_build_timestamp_seconds", () -> (double) buildTimestampSeconds)
                    .description("Application build timestamp in seconds since epoch")
                    .tag("name", applicationName)
                    .tag("version", applicationVersion)
                    .register(meterRegistry);
        } catch (Exception e) {
            // If timestamp parsing fails, just set current time
            Gauge.builder("application_build_timestamp_seconds", () -> (double) Instant.now().getEpochSecond())
                    .description("Application build timestamp in seconds since epoch")
                    .tag("name", applicationName)
                    .tag("version", applicationVersion)
                    .register(meterRegistry);
        }
    }
}
