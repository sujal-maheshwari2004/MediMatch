from langchain_community.document_loaders import PyMuPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
import os

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Load all PDF files from the data directory
loader = DirectoryLoader(
    "data",
    glob="**/*.pdf",
    loader_cls=PyMuPDFLoader
)
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(data)

embeddings = OllamaEmbeddings(
    model="llama3",
)

vectorstore = FAISS.from_documents(chunks, embeddings)

vectorstore.save_local("vectorstore")


