from fastapi import FastAPI

@app.get("/")
async def root():
    return {"message": "Hello World"}