from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

def create_and_save_embeddings(doc_chunks, model_name="llama3", output_dir="vectorstore"):
    """
    Generates vector embeddings from given document chunks using the specified Ollama model
    and stores them locally with FAISS.

    Parameters:
        doc_chunks (list): The text segments to be embedded.
        model_name (str): Identifier for the Ollama embedding model.
        output_dir (str): Directory to store the resulting FAISS vector index.
    """
    # this function make the vector from chunks and keep in faiss
    embedding_model = OllamaEmbeddings(model=model_name)  # it using model for make embed
    faiss_index = FAISS.from_documents(doc_chunks, embedding_model)  # it take chunk and model and make vector db
    faiss_index.save_local(output_dir)  # now saving it local place by output dir
