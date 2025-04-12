from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
import os
def create_and_save_embeddings(chunks, model_name="llama3", save_path="vectorstore"):
    """
    Create embeddings from chunks and save to vectorstore
    Args:
        chunks (list): List of document chunks
        model_name (str): Name of the Ollama model to use
        save_path (str): Path to save the vectorstore
    """
    embeddings = OllamaEmbeddings(model=model_name)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(save_path)