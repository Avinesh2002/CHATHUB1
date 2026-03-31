import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

try:
    llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", google_api_key=api_key, temperature=0.1)
    res = llm.invoke("Hi")
    print(f"Success! Response: {res.content}")
except Exception as e:
    print(f"Error: {e}")
