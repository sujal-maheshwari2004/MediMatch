from data_ingestion import get_chunks
from preprocessing import create_and_save_embeddings
from multiagent import load_vectorstore, load_questions, initialize_llm, process_questions, save_responses

def main():
    # Step 1: Data Ingestion - Load and split PDF files into chunks
    print("Loading and splitting PDF files into chunks...")
    chunks = get_chunks(data_directory="data", chunk_size=1000, chunk_overlap=200)
    print(f"Generated {len(chunks)} chunks from the documents.")

    # Step 2: Preprocessing - Create embeddings and save to vectorstore
    print("Creating embeddings and saving to vectorstore...")
    create_and_save_embeddings(chunks, model_name="llama3", save_path="vectorstore")
    print("Embeddings saved successfully.")

    # Step 3: Load vectorstore
    print("Loading vectorstore...")
    vectorstore = load_vectorstore(model_name="llama2", vectorstore_path="vectorstore")
    print("Vectorstore loaded successfully.")

    # Step 4: Load questions
    print("Loading question set...")
    question_set = load_questions(filepath="questionset.json")
    print("Question set loaded successfully.")

    # Step 5: Initialize LLM
    print("Initializing LLM...")
    llm = initialize_llm(model_name="llama2", temperature=0.1, max_tokens=100)
    print("LLM initialized successfully.")

    # Step 6: Process questions and get responses
    need_organ = "heart"  # Specify the organ of interest
    print(f"Processing questions for organ: {need_organ}...")
    responses = process_questions(need_organ, question_set, vectorstore, llm)
    print("Questions processed successfully.")

    # Step 7: Save responses
    print("Saving responses to file...")
    save_responses(responses, output_filepath="heart_answers.json")
    print("Responses saved successfully.")

if __name__ == "__main__":
    main()