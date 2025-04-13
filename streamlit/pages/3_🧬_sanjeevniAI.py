import streamlit as st
import os
import shutil
import re
from pages.sanjeevniAI_modules.data_ingestion import get_chunks
from pages.sanjeevniAI_modules.preprocessing import create_and_save_embeddings
from pages.sanjeevniAI_modules.multiagent import load_vectorstore, load_questions, initialize_llm, process_questions

# Save uploaded PDFs to local directory
def save_uploaded_files(uploaded_files, save_dir="data"):
    os.makedirs(save_dir, exist_ok=True)
    saved_paths = []
    for i, uploaded_file in enumerate(uploaded_files):
        safe_name = st.session_state.get("selected_patient", "unknown_patient").replace(" ", "_")
        file_path = os.path.join(save_dir, f"{safe_name}_report_{i + 1}.pdf")
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        saved_paths.append(file_path)
    return saved_paths

# Map severity score to urgency label
def map_score_to_urgency(score):
    if score <= 1e-14:
        return "Low"
    elif score <= 1e-13:
        return "Moderate"
    elif score <= 1e-12:
        return "High"
    else:
        return "Critical"

def main():
    st.set_page_config(page_title="Medical Severity Scorer", layout="centered")
    st.title("🧬 Organ Transplant Severity Scorer")
    st.markdown("Upload medical reports (PDFs) and specify the organ of interest to evaluate severity.")

    # Display appointment context
    if "selected_patient" in st.session_state:
        st.subheader(f"Uploading for: {st.session_state.selected_patient}")
        st.markdown(f"""
        📝 **Reason:** {st.session_state.selected_reason}  
        📅 **Date:** {st.session_state.selected_date}  
        🕒 **Time:** {st.session_state.selected_time}
        """)
    else:
        st.warning("No patient selected. Please go back to the Doctor Portal.")
        return

    uploaded_files = st.file_uploader("Upload Medical Reports", type=["pdf"], accept_multiple_files=True)
    organ = st.text_input("Organ of Interest (e.g., liver, heart, kidney)")

    if st.button("Evaluate"):
        if not uploaded_files or not organ.strip():
            st.error("Please upload files and specify a valid organ.")
            return

        try:
            # Step 1: Save uploaded files
            saved_files = save_uploaded_files(uploaded_files)

            # Step 2: Chunk the data
            chunks = get_chunks(data_directory="data", chunk_size=1000, chunk_overlap=200)

            # Step 3: Create embeddings
            create_and_save_embeddings(chunks, model_name="llama3.2", output_dir="vectorstore")

            # Step 4: Load vectorstore
            vectorstore = load_vectorstore(model_name="llama3.2", vectorstore_path="vectorstore")

            # Step 5: Load questions
            question_set = load_questions(filepath="questionset.json")

            # Step 6: Initialize LLM
            llm = initialize_llm(model_name="llama3.2", temperature=0.1, max_tokens=100)

            # Step 7: Ask questions and get responses
            responses = process_questions(organ, question_set, vectorstore, llm)

            # Step 8: Show responses
            st.success("✅ Evaluation Complete")
            st.subheader("Vital Responses")
            for question, answer in responses.items():
                st.markdown(f"**{question}**: {answer}")

            # Step 9: Severity scoring for heart
            if organ.strip().lower() == "heart":
                # Coefficients for heart
                coeffs = {
                    "intercept": 0.9999999999999813,
                    "heart_attack": 1.0519363158323358e-14,
                    "cardiomyopathy": 8.049116928532385e-16,
                    "heart_valve": 3.3306690738754696e-15,
                    "heart_defect": -3.0253577421035516e-15,
                    "age": 8.754932542820448e-18,
                    "bp": -1.496198998029996e-17
                }

                # Extract features from responses
                features = {
                    "heart_attack": 0,
                    "cardiomyopathy": 0,
                    "heart_valve": 0,
                    "heart_defect": 0,
                    "age": 0,
                    "bp": 0
                }

                for question, answer in responses.items():
                    answer_lower = answer.lower()
                    if "heart attack" in question.lower():
                        features["heart_attack"] = 1 if "yes" in answer_lower else 0
                    elif "cardiomyopathy" in question.lower():
                        features["cardiomyopathy"] = 1 if "yes" in answer_lower else 0
                    elif "heart valve" in question.lower():
                        features["heart_valve"] = 1 if "yes" in answer_lower else 0
                    elif "heart defect" in question.lower():
                        features["heart_defect"] = 1 if "yes" in answer_lower else 0
                    elif "age" in question.lower():
                        match = re.search(r"\d+", answer)
                        if match:
                            features["age"] = int(match.group())
                    elif "blood pressure" in question.lower() or "bp" in question.lower():
                        match = re.search(r"\d+", answer)
                        if match:
                            features["bp"] = int(match.group())

                # Calculate severity score
                severity_score = coeffs["intercept"]
                for key in features:
                    severity_score += features[key] * coeffs[key]

                urgency_code = map_score_to_urgency(severity_score)

                # Step 10: Store results in session state
                st.session_state["severity_score"] = severity_score
                st.session_state["urgency_code"] = urgency_code
                st.session_state["patient_info"] = {
                    "name": st.session_state.selected_patient,
                    "reason": st.session_state.selected_reason,
                    "date": st.session_state.selected_date,
                    "time": st.session_state.selected_time
                }

                # Step 11: Display score and urgency
                st.subheader("🧮 Severity Evaluation Result (Heart)")
                st.metric("Severity Score", f"{severity_score:.10f}")
                st.success(f"🚨 Urgency Code: **{urgency_code}**")

                # Forward to Verifier Portal
                st.switch_page("pages/4_🔍_Verifier_Portal.py")

        except Exception as e:
            st.error(f"Something went wrong: {e}")

    # Optional cleanup
    if os.path.exists("data"):
        shutil.rmtree("data")

if __name__ == "__main__":
    main()
