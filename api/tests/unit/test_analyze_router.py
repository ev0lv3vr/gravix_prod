"""Unit tests for failure analysis outage handling."""

from unittest.mock import MagicMock

from fastapi.responses import JSONResponse

from main import _apply_error_cors_headers, http_exception_handler
from routers.analyze import _mark_analysis_failed


def test_mark_analysis_failed_falls_back_when_error_detail_column_missing():
    db = MagicMock()
    first_chain = MagicMock()
    second_chain = MagicMock()
    db.table.return_value.update.side_effect = [first_chain, second_chain]
    first_chain.eq.return_value.execute.side_effect = Exception("PGRST204 missing column")

    _mark_analysis_failed(db, "analysis-1", "RuntimeError: failed")

    first_update = db.table.return_value.update.call_args_list[0].args[0]
    second_update = db.table.return_value.update.call_args_list[1].args[0]
    assert first_update["status"] == "failed"
    assert first_update["error_detail"] == "RuntimeError: failed"
    assert second_update["status"] == "failed"
    assert "error_detail" not in second_update


def test_error_cors_headers_are_added_for_allowed_origin():
    request = MagicMock()
    request.headers = {"origin": "https://gravix.com"}
    response = JSONResponse(status_code=500, content={"detail": "Internal server error"})

    result = _apply_error_cors_headers(request, response)

    assert result.headers["Access-Control-Allow-Origin"] == "https://gravix.com"
    assert result.headers["Access-Control-Allow-Credentials"] == "true"
    assert result.headers["Vary"] == "Origin"


async def test_http_5xx_exception_handler_adds_cors_for_allowed_origin():
    request = MagicMock()
    request.headers = {"origin": "https://gravix.com"}
    exc = MagicMock()
    exc.status_code = 500
    exc.detail = "Database error"
    exc.headers = None

    response = await http_exception_handler(request, exc)

    assert response.status_code == 500
    assert response.headers["Access-Control-Allow-Origin"] == "https://gravix.com"
