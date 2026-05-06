"""
Basic tests for ML Service
"""
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "aegisops-ml-service"
    assert "model_ready" in data


def test_predict_endpoint():
    """Test predict endpoint with valid input"""
    payload = {
        "severity": 8.5,
        "frequency": 7.0,
        "recency": 9.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_priority" in data
    assert "model_version" in data
    assert "inputs" in data
    assert 0 <= data["predicted_priority"] <= 10


def test_predict_invalid_input():
    """Test predict endpoint with invalid input"""
    payload = {
        "severity": 15.0,  # Invalid: > 10
        "frequency": 7.0,
        "recency": 9.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Validation error


def test_model_info_endpoint():
    """Test model info endpoint"""
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "model_version" in data
