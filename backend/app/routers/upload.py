from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from app.models import ForecastResponse
from app.services.csv_service import parse_and_evaluate_csv, SAMPLE_CSV_CONTENT

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("/csv", response_model=ForecastResponse)
async def upload_csv_file(file: UploadFile = File(...)):
    """
    Upload a CSV containing hourly demand predictions.
    Computes microgrid switching rules and overload alerts automatically.
    """
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a valid CSV file."
        )

    try:
        content = await file.read()
        forecast = parse_and_evaluate_csv(content, file.filename)
        return forecast
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@router.get("/template")
def download_csv_template():
    """
    Download a sample CSV file with appropriate columns and example demand values.
    """
    return Response(
        content=SAMPLE_CSV_CONTENT,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=smartgrid_sample_forecast.csv"
        }
    )
