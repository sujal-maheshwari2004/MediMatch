from langchain_ollama import ChatOllama, embeddings as ollama_embeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
import json

def load_vectorstore(model_name="llama2", vectorstore_path="vectorstore"):
    """
    Load the FAISS vectorstore and embeddings.
    """
    ollama_embed = ollama_embeddings.OllamaEmbeddings(model=model_name)
    vectorstore = FAISS.load_local(
        vectorstore_path,
        embeddings=ollama_embed,
        allow_dangerous_deserialization=True
    )
    return vectorstore

def load_questions(filepath="questionset.json"):
    """
    Load the question set from a JSON file.
    """
    with open(filepath) as f:
        return json.load(f)

def initialize_llm(model_name="llama2", temperature=0.1, max_tokens=100):
    """
    Initialize the ChatOllama LLM.
    """
    return ChatOllama(model=model_name, temperature=temperature, max_tokens=max_tokens)

def process_questions(need_organ, question_set, vectorstore, llm):
    """
    Process the questions for the specified organ and return responses.
    """
    responses = {}

    for key in question_set[need_organ]:
        q_data = question_set[need_organ][key]

        # Build the input question string
        if "unit" in q_data:
            input_question = f"{q_data['question']} (in {q_data['unit']})"
        elif "note" in q_data:
            input_question = f"{q_data['question']} ({q_data['note']})"
        elif "options" in q_data:
            input_question = f"{q_data['question']} (Options: {', '.join(q_data['options'])})"
        else:
            input_question = q_data["question"]

        # Query the FAISS vector store for relevant documents
        relevant_docs = vectorstore.similarity_search(input_question, k=3)

        # Combine the retrieved documents' content with the question
        context = "\n".join([doc.page_content for doc in relevant_docs])

        # Format the prompt to get only the precise answer
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a medical assistant AI. Answer with ONLY the precise value, number, or option. Do not explain."),
            ("human", f"Context:\n{context}\n\nQuestion: {input_question}")
        ])

        chain = prompt | llm
        response = chain.invoke({"input": input_question})

        # Store response in the dictionary
        responses[key] = response.content.strip()

        # Also print for live tracking
        print(f"Q: {input_question}")
        print(f"A: {response.content}\n")

    return responses

def save_responses(responses, output_filepath="heart_answers.json"):
    """
    Save the responses to a JSON file.
    """
    with open(output_filepath, "w") as outfile:
        json.dump(responses, outfile, indent=4)
    print(f"All answers saved to '{output_filepath}'")