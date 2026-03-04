
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import pickle
from pathlib import Path


def load_edu_vectordb(index_path, docs_path):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Load docstore separately if needed
    with open(docs_path, "rb") as f:
        docstore = pickle.load(f)
    
    # Load FAISS index safely
    vectordb = FAISS.load_local(
        index_path,
        embeddings,
        allow_dangerous_deserialization=True  
    )
    
    # Print confirmation
    print("FAISS vector DB loaded successfully!")
    
    # Access internal dictionary to count documents
    num_docs = len(vectordb.docstore._dict)
    print("Number of documents in DB:", num_docs)
    
    # Print first document content as a sample
    if num_docs > 0:
        first_doc = list(vectordb.docstore._dict.values())[0]
        print("Sample document content:", first_doc.page_content[:200], "...")
    
    return vectordb


def search_docs(vectordb, query, top_k=3):
    docs_and_scores = vectordb.similarity_search_with_score(query, k=top_k)
    return [doc.page_content for doc, score in docs_and_scores]

def get_all_chapters(vectordb):
    all_docs = vectordb.docstore._dict.values()
    return sorted(set(doc.metadata.get("chapter") for doc in all_docs if doc.metadata.get("chapter")))

def get_chapter_content(vectordb, chapter):
    all_docs = vectordb.docstore._dict.values()
    chapter_docs = [doc for doc in all_docs if doc.metadata.get("chapter") == chapter]
    return [doc.page_content for doc in chapter_docs]
