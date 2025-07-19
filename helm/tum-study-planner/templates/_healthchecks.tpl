{{/*
Health Check Configuration Helper
*/}}
{{- define "tum-study-planner.healthChecks" -}}
{{- if .Values.healthChecks.enabled }}
livenessProbe:
  {{- if eq .service "client" }}
  httpGet:
    path: /
    port: {{ .port | default 80 }}
  {{- else }}
  httpGet:
    path: /actuator/health
    port: {{ .port | default 8080 }}
  {{- end }}
  initialDelaySeconds: {{ .Values.healthChecks.livenessProbe.initialDelaySeconds | default 30 }}
  periodSeconds: {{ .Values.healthChecks.livenessProbe.periodSeconds | default 10 }}
  timeoutSeconds: {{ .Values.healthChecks.livenessProbe.timeoutSeconds | default 5 }}
  failureThreshold: {{ .Values.healthChecks.livenessProbe.failureThreshold | default 3 }}
  successThreshold: {{ .Values.healthChecks.livenessProbe.successThreshold | default 1 }}

readinessProbe:
  {{- if eq .service "client" }}
  httpGet:
    path: /
    port: {{ .port | default 80 }}
  {{- else }}
  httpGet:
    path: /actuator/health/readiness
    port: {{ .port | default 8080 }}
  {{- end }}
  initialDelaySeconds: {{ .Values.healthChecks.readinessProbe.initialDelaySeconds | default 10 }}
  periodSeconds: {{ .Values.healthChecks.readinessProbe.periodSeconds | default 5 }}
  timeoutSeconds: {{ .Values.healthChecks.readinessProbe.timeoutSeconds | default 3 }}
  failureThreshold: {{ .Values.healthChecks.readinessProbe.failureThreshold | default 3 }}
  successThreshold: {{ .Values.healthChecks.readinessProbe.successThreshold | default 1 }}

startupProbe:
  {{- if eq .service "client" }}
  httpGet:
    path: /
    port: {{ .port | default 80 }}
  {{- else }}
  httpGet:
    path: /actuator/health
    port: {{ .port | default 8080 }}
  {{- end }}
  initialDelaySeconds: {{ .Values.healthChecks.startupProbe.initialDelaySeconds | default 10 }}
  periodSeconds: {{ .Values.healthChecks.startupProbe.periodSeconds | default 10 }}
  timeoutSeconds: {{ .Values.healthChecks.startupProbe.timeoutSeconds | default 5 }}
  failureThreshold: {{ .Values.healthChecks.startupProbe.failureThreshold | default 30 }}
  successThreshold: {{ .Values.healthChecks.startupProbe.successThreshold | default 1 }}
{{- end }}
{{- end }}
