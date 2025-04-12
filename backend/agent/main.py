from data_ingestion import get_chunks
from preprocessing import create_and_save_embeddings
from multiagent import load_vectorstore, load_questions, initialize_llm, process_questions, save_responses

def main():
    # Step 1: getting data - load pdf and cut them into piece
    print("Loading and splitting PDF files into chunks.....")
    chunks = get_chunks(data_directory="data", chunk_size=1000, chunk_overlap=200)
    print(f"Generated {len(chunks)} chunks from the documents.")

    # Step 2: make embedings and keep in vector storr
    print("Creating embeddings and saving to vectorstore.....")
    create_and_save_embeddings(chunks, model_name="llama3", output_dir="vectorstore")
    print("Embeddings saved succesfully.")

    # Step 3: now we load the vectorstore back
    print("Loading vectorstore.....")
    vectorstore = load_vectorstore(model_name="llama2", vectorstore_path="vectorstore")
    print("Vectorstore loaded succesfully.")

    # Step 4: taking all the question from json file
    print("Loading question set.....")
    question_set = load_questions(filepath="questionset.json")
    print("Question set loaded succesfully.")

    # Step 5: start the llm model
    print("Initializing LLM.....")
    llm = initialize_llm(model_name="llama2", temperature=0.1, max_tokens=100)
    print("LLM initialized succesfully.")

    # Step 6: ask all que for selected organ
    need_organ = "heart"  # we are asking about heart now
    print(f"Processing questions for organ: {need_organ}...")
    responses = process_questions(need_organ, question_set, vectorstore, llm)
    print("Questions processed succesfully.")

    # Step 7: save the answars in a json file
    print("Saving responses to file.....")
    save_responses(responses, output_filepath="heart_answers.json")
    print("Responses saved succesfully.")

if __name__ == "__main__":
    main()
