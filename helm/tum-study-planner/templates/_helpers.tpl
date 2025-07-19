{{/*
Expand the name of the chart.
*/}}
{{- define "tum-study-planner.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "tum-study-planner.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "tum-study-planner.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "tum-study-planner.labels" -}}
helm.sh/chart: {{ include "tum-study-planner.chart" . }}
{{ include "tum-study-planner.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "tum-study-planner.selectorLabels" -}}
app.kubernetes.io/name: {{ include "tum-study-planner.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "tum-study-planner.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "tum-study-planner.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

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
