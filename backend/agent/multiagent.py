from langchain_ollama import ChatOllama, embeddings as ollama_embeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
import json

def load_vectorstore(model_name="llama2", vectorstore_path="vectorstore"):
    """
    Load the FAISS vectorstore and embeddings.
    """
    # make embedding using ollama with the given model name
    ollama_embed = ollama_embeddings.OllamaEmbeddings(model=model_name)

    # load the vector store from local place
    vectorstore = FAISS.load_local(
        vectorstore_path,
        embeddings=ollama_embed,
        allow_dangerous_deserialization=True  # this is need to read the vector store safely
    )
    return vectorstore

def load_questions(filepath="questionset.json"):
    """
    Load the question set from a JSON file.
    """
    # open json file and load all question in python dictionary
    with open(filepath) as f:
        return json.load(f)

def initialize_llm(model_name="llama2", temperature=0.1, max_tokens=100):
    """
    Initialize the ChatOllama LLM.
    """
    # we use ollama chat model here to get response from question
    return ChatOllama(model=model_name, temperature=temperature, max_tokens=max_tokens)

def process_questions(need_organ, question_set, vectorstore, llm):
    """
    Process the questions for the specified organ and return responses.
    """
    responses = {}

    for key in question_set[need_organ]:
        q_data = question_set[need_organ][key]

        # make full question based on what extra thing is there
        if "unit" in q_data:
            input_question = f"{q_data['question']} (in {q_data['unit']})"
        elif "note" in q_data:
            input_question = f"{q_data['question']} ({q_data['note']})"
        elif "options" in q_data:
            input_question = f"{q_data['question']} (Options: {', '.join(q_data['options'])})"
        else:
            input_question = q_data["question"]

        # search relevant docs from vector store for this question
        relevant_docs = vectorstore.similarity_search(input_question, k=3)

        # get context by join all content of docs
        context = "\n".join([doc.page_content for doc in relevant_docs])

        # prompt to tell AI to only give answer not extra stuff
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a medical assistant AI. Answer with ONLY the precise value, number, or option. Do not explain."),
            ("human", f"Context:\n{context}\n\nQuestion: {input_question}")
        ])

        # run the llm with question and context
        chain = prompt | llm
        response = chain.invoke({"input": input_question})

        # store answer in output dict
        responses[key] = response.content.strip()

        # also print the question and ans
        print(f"Q: {input_question}")
        print(f"A: {response.content}\n")

    return responses

def save_responses(responses, output_filepath="heart_answers.json"):
    """
    Save the responses to a JSON file.
    """
    # write all answer in file as json form
    with open(output_filepath, "w") as outfile:
        json.dump(responses, outfile, indent=4)
    print(f"All answers saved to '{output_filepath}'")  # print confirm mesage
