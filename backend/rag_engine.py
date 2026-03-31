import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

# Load environment logic
load_dotenv()

# We will initialize this as a global variable. In a production app,
# you'd likely write this to disk or use a managed vector DB (like Pinecone).
_vectorstore = None

def init_llm_and_embeddings():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment. Please add it to your .env file.")
        
    # We use Google's embedding model
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
    # Using flash for faster responses, or you could use gemini-1.5-pro
    llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", google_api_key=api_key, temperature=0.1)
    
    return llm, embeddings


def process_and_index_documents(texts, metadatas=None):
    global _vectorstore
    
    # 1. Split Text into 500-1000 token chunks as requested.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    chunks = text_splitter.create_documents(texts, metadatas=metadatas)
    
    if not chunks:
        raise ValueError("No text could be extracted or chunked from the documents.")
    
    # 2. Embed and Store
    llm, embeddings = init_llm_and_embeddings()
    
    new_vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # Merge with existing store if present, else create new
    if _vectorstore is None:
        _vectorstore = new_vectorstore
    else:
        _vectorstore.merge_from(new_vectorstore)
        
    return _vectorstore


def generate_answer(query):
    global _vectorstore
    
    if _vectorstore is None:
        return "The answer is not available in the provided documents. Please upload documents first.", []
        
    llm, embeddings = init_llm_and_embeddings()
    
    # 1. Retrieve top 3-5 chunks (k=4)
    retriever = _vectorstore.as_retriever(search_kwargs={"k": 4})
    docs = retriever.invoke(query)
    
    # 2. Extract context text
    context_text = "\n\n---\n\n".join([f"Source: {doc.metadata.get('source', 'Unknown')}\nContent: {doc.page_content}" for doc in docs])
    
    # 3. Prompt Template
    template = """
    You are a document-based assistant. Answer ONLY using the provided context. 
    If the answer is not present, say 'The answer is not available in the provided documents.'
    Use bullet points if needed. Keep answers concise but informative.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:
    """
    
    prompt = PromptTemplate.from_template(template)
    chain = prompt | llm
    
    response = chain.invoke({
        "context": context_text,
        "question": query
    })
    
    # 4. Optional: Format the metadata/sources for return
    sources = [{"source": doc.metadata.get("source", "Unknown"), "page_content": doc.page_content[:150] + "..."} for doc in docs]
    
    return response.content, sources


def clear_index():
    global _vectorstore
    _vectorstore = None
