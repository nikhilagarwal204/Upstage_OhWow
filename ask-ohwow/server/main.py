from fastapi import FastAPI, HTTPException, Request
import uvicorn
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPSTAGE_API_KEY = "up_**************************"

client = OpenAI(api_key=UPSTAGE_API_KEY, base_url="https://api.upstage.ai/v1/solar")


async def query_gpt_model(prompt: str):

    result = client.chat.completions.create(
        model="solar-pro",
        messages=[
            {
                "role": "system",
                "content": 'Act as a tour guide, providing short, factual, and engaging one-sentence answers to all user questions."',
            },
            {"role": "user", "content": prompt},
        ],
        stream=False,
    )

    return result.choices[0].message.content


@app.get("/")
def read_root():
    return "Welcome to Constellation Backend APIs"


@app.post("/llm")
async def process_text(request: Request):
    body = await request.json()
    user_prompt = body.get("text")

    if not user_prompt:
        raise HTTPException(status_code=400, detail="No text provided")

    answer = await query_gpt_model(user_prompt)
    print(answer)
    return answer
