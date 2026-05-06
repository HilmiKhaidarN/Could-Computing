"""
AegisOps ML Service
FastAPI microservice untuk prediksi skor prioritas laporan infrastruktur.

Endpoint:
  GET  /health       — cek status service
  POST /predict      — prediksi priority score
  GET  /model/info   — metadata model
"""

import logging
import os

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model.predictor import Predictor

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AegisOps ML Service",
    description=(
        "Microservice prediksi skor prioritas laporan infrastruktur kota "
        "menggunakan Linear Regression (Severity × Frequency × Recency)."
    ),
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi predictor sekali saat startup
predictor = Predictor()
logger.info("Predictor siap digunakan.")


# ─── Schemas ──────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    """Input untuk prediksi skor prioritas."""

    severity: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Tingkat keparahan dampak (0–10)",
        example=8.5,
    )
    frequency: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Frekuensi laporan dalam 30 hari terakhir (0–10)",
        example=7.0,
    )
    recency: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Kebaruan laporan — semakin baru semakin tinggi (0–10)",
        example=9.0,
    )


class PredictResponse(BaseModel):
    """Output prediksi skor prioritas."""

    model_config = {"protected_namespaces": ()}

    predicted_priority: float = Field(
        ...,
        description="Skor prioritas hasil prediksi model (0–10)",
    )
    model_version: str = Field(..., description="Versi model yang digunakan")
    inputs: PredictRequest = Field(..., description="Input yang diterima")


class HealthResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    status: str
    service: str
    model_ready: bool


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check() -> HealthResponse:
    """Cek apakah service dan model berjalan dengan baik."""
    return HealthResponse(
        status="ok",
        service="aegisops-ml-service",
        model_ready=predictor.model is not None,
    )


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(request: PredictRequest) -> PredictResponse:
    """
    Prediksi skor prioritas laporan berdasarkan severity, frequency, dan recency.

    Skor yang dihasilkan berada dalam rentang 0–10, di mana 10 adalah prioritas tertinggi.
    """
    try:
        score = predictor.predict(
            severity=request.severity,
            frequency=request.frequency,
            recency=request.recency,
        )
        return PredictResponse(
            predicted_priority=score,
            model_version=predictor.get_info()["model_version"],
            inputs=request,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during prediction")
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@app.get("/model/info", tags=["Model"])
def model_info() -> dict:
    """Kembalikan metadata model: versi, koefisien, metrik evaluasi."""
    return predictor.get_info()


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("ML_SERVICE_PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
