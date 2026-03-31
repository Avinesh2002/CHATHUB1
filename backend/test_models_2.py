import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

try:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
    res = embeddings.embed_query("hello world")
    print(f"Success! Embedded dim: {len(res)}")
except Exception as e:
    print(f"Error {e}")
