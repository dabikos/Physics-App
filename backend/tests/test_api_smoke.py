from fastapi.testclient import TestClient

from server import app


def test_root_endpoint_returns_api_metadata():
    client = TestClient(app)

    response = client.get("/api/")

    assert response.status_code == 200
    assert response.json() == {"message": "Physics AI API", "version": "1.0"}
