"""
Predictor module — Linear Regression model untuk prediksi skor prioritas laporan.

Model dilatih saat inisialisasi menggunakan dataset lokal (data/dataset.csv).
Fitur input: severity (0-10), frequency (0-10), recency (0-10).
Output: predicted_priority (float, skala 0-10).
"""

import os
import logging
from typing import Dict, Any

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib

logger = logging.getLogger(__name__)

# ─── Konstanta ────────────────────────────────────────────────────────────────

MODEL_VERSION = "1.1.0"
FEATURES = ["severity", "frequency", "recency"]
TARGET = "priority"

_BASE_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(_BASE_DIR, "..", "data", "dataset.csv")
MODEL_SAVE_PATH = os.path.join(_BASE_DIR, "trained_model.pkl")
SCALER_SAVE_PATH = os.path.join(_BASE_DIR, "scaler.pkl")


# ─── Predictor ────────────────────────────────────────────────────────────────

class Predictor:
    """
    Melatih Linear Regression dari dataset CSV dan menyediakan
    fungsi predict(severity, frequency, recency) -> float.
    """

    def __init__(self) -> None:
        self.model: LinearRegression | None = None
        self.scaler: MinMaxScaler | None = None
        self.metrics: Dict[str, float] = {}
        self._initialize()

    # ── Init ──────────────────────────────────────────────────────────────────

    def _initialize(self) -> None:
        """Load model dari disk jika ada, atau latih ulang dari dataset."""
        if os.path.exists(MODEL_SAVE_PATH) and os.path.exists(SCALER_SAVE_PATH):
            self._load_from_disk()
        else:
            self._train()

    # ── Training ──────────────────────────────────────────────────────────────

    def _train(self) -> None:
        """Baca dataset, latih model, simpan ke disk."""
        logger.info("Melatih model Linear Regression dari dataset...")

        df = self._load_dataset()
        X = df[FEATURES].values
        y = df[TARGET].values

        # Normalisasi fitur ke [0, 1]
        self.scaler = MinMaxScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Split train/test (80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        # Latih model
        self.model = LinearRegression()
        self.model.fit(X_train, y_train)

        # Evaluasi
        y_pred = self.model.predict(X_test)
        self.metrics = {
            "mse": float(mean_squared_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "r2": float(r2_score(y_test, y_pred)),
            "training_samples": len(X_train),
            "test_samples": len(X_test),
        }

        # Simpan ke disk
        joblib.dump(self.model, MODEL_SAVE_PATH)
        joblib.dump(self.scaler, SCALER_SAVE_PATH)

        logger.info(
            "Model berhasil dilatih. R²=%.4f, RMSE=%.4f",
            self.metrics["r2"],
            self.metrics["rmse"],
        )

    def _load_from_disk(self) -> None:
        """Muat model dan scaler yang sudah tersimpan."""
        logger.info("Memuat model dari disk...")
        self.model = joblib.load(MODEL_SAVE_PATH)
        self.scaler = joblib.load(SCALER_SAVE_PATH)
        self.metrics = {"note": "loaded from disk"}
        logger.info("Model berhasil dimuat.")

    def _load_dataset(self) -> pd.DataFrame:
        """Baca dan validasi dataset CSV."""
        if not os.path.exists(DATASET_PATH):
            raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")

        df = pd.read_csv(DATASET_PATH)

        missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
        if missing:
            raise ValueError(f"Kolom tidak ditemukan di dataset: {missing}")

        # Hapus baris dengan nilai kosong
        df = df[FEATURES + [TARGET]].dropna()

        if len(df) < 5:
            raise ValueError("Dataset terlalu kecil (minimal 5 baris).")

        return df

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(self, severity: float, frequency: float, recency: float) -> float:
        """
        Prediksi skor prioritas berdasarkan tiga fitur.

        Args:
            severity:  Tingkat keparahan (0–10)
            frequency: Frekuensi laporan (0–10)
            recency:   Kebaruan laporan (0–10)

        Returns:
            predicted_priority: float dalam rentang 0–10
        """
        if self.model is None or self.scaler is None:
            raise RuntimeError("Model belum diinisialisasi.")

        # Validasi rentang input
        for name, val in [("severity", severity), ("frequency", frequency), ("recency", recency)]:
            if not (0.0 <= val <= 10.0):
                raise ValueError(f"Nilai '{name}' harus berada di antara 0 dan 10, diterima: {val}")

        X = np.array([[severity, frequency, recency]], dtype=float)
        X_scaled = self.scaler.transform(X)
        raw = float(self.model.predict(X_scaled)[0])

        # Clamp ke [0, 10]
        return round(max(0.0, min(10.0, raw)), 2)

    # ── Info ──────────────────────────────────────────────────────────────────

    def get_info(self) -> Dict[str, Any]:
        """Kembalikan metadata model untuk endpoint /model/info."""
        coef: Dict[str, float] = {}
        intercept: float = 0.0

        if self.model is not None:
            coef = dict(zip(FEATURES, [round(float(c), 4) for c in self.model.coef_]))
            intercept = round(float(self.model.intercept_), 4)

        return {
            "model_version": MODEL_VERSION,
            "algorithm": "Linear Regression",
            "features": FEATURES,
            "target": TARGET,
            "model_loaded": self.model is not None,
            "coefficients": coef,
            "intercept": intercept,
            "metrics": self.metrics,
        }
