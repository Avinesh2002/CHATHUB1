import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from document_processor import extract_text
from rag_engine import process_and_index_documents, generate_answer, clear_index

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes so the React frontend can talk to this backend
CORS(app)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'ppt', 'pptx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    texts = []
    metadatas = []
    
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            try:
                # Read text from file
                text = extract_text(file, filename)
                if text:
                    texts.append(text)
                    metadatas.append({"source": filename})
            except Exception as e:
                return jsonify({"error": f"Error processing {filename}: {str(e)}"}), 500
                
    if not texts:
        return jsonify({"error": "No valid text could be extracted from the files. Please ensure they contain text."}), 400
        
    try:
        process_and_index_documents(texts, metadatas)
        return jsonify({
            "message": f"Successfully processed {len(texts)} document(s).",
            "files": [m['source'] for m in metadatas]
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error indexing documents: {str(e)}"}), 500


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided"}), 400
        
    query = data['query']
    
    try:
        answer, sources = generate_answer(query)
        return jsonify({
            "answer": answer,
            "sources": sources
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error generating answer: {str(e)}"}), 500


@app.route('/clear', methods=['POST'])
def clear():
    try:
        clear_index()
        return jsonify({"message": "Index and uploaded memory cleared successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Error clearing index: {str(e)}"}), 500


if __name__ == '__main__':
    # Ensure GEMINI_API_KEY is available during startup (warning only)
    if not os.environ.get("GEMINI_API_KEY"):
        print("\n" + "="*50)
        print("WARNING: GEMINI_API_KEY not found in environment variables.")
        print("Please create a .env file and add: GEMINI_API_KEY=your_key")
        print("="*50 + "\n")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
