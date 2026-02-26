from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import detector  # Import our ML model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://phishproof.netlify.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_text(request: AnalyzeRequest):
    # The predict function now handles the ML logic
    result = detector.predict(request.text)
    return result
@app.get("/health")
async def health_check():
    return {"status": "ok"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)