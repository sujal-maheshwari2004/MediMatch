from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

def create_and_save_embeddings(doc_chunks, model_name="llama3.2", output_dir="vectorstore"):
    """
    Generates vector embeddings from given document chunks using the specified Ollama model
    and stores them locally with FAISS.
    """
    # this function make the vector from chunks and keep in faiss
    embedding_model = OllamaEmbeddings(model=model_name)  # it using model for make embed
    faiss_index = FAISS.from_documents(doc_chunks, embedding_model)  # it take chunk and model and make vector db
    faiss_index.save_local(output_dir)  # now saving it local place by output dir
