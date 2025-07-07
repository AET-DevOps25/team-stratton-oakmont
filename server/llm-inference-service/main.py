from fastapi import FastAPI
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import time

app = FastAPI()

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.middleware("http")
async def prometheus_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    REQUEST_COUNT.labels(
        method=request.method, 
        endpoint=request.url.path, 
        status=response.status_code
    ).inc()
    REQUEST_DURATION.observe(time.time() - start_time)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/infer/")
async def infer(data: dict):
    # This is a placeholder for the actual LLM inference logic.
    # For example, using a pre-loaded model
    prompt = data.get("prompt", "")
    # Replace with actual LLM call
    response = f"LLM response to: {prompt}" 
    return {"inference": response}

@app.get("/")
async def root():
    return {"message": "LLM Inference Service is running"}

# Add other endpoints here