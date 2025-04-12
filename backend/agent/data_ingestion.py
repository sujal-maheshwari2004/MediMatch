from langchain_community.document_loaders import PyMuPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

def get_chunks(data_directory="data", chunk_size=1000, chunk_overlap=200):
    """
    Loads PDF files from the specified directory, splits them into chunks, and returns the chunks.

    Args:
        data_directory (str): Path to the directory containing PDF files.
        chunk_size (int): Size of each text chunk.
        chunk_overlap (int): Overlap between consecutive chunks.

    Returns:
        list: A list of text chunks.
    """
    # create data folder if not exist, so we dont get error
    os.makedirs(data_directory, exist_ok=True)

    # load all pdf file from the folder giving
    loader = DirectoryLoader(
        data_directory,
        glob="**/*.pdf",
        loader_cls=PyMuPDFLoader
    )
    data = loader.load()

    # now we split big text into small one with overlaping
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    chunks = text_splitter.split_documents(data)

    return chunks  # finaly we give all chuks back from here
