import streamlit as st
import pandas as pd

# Set page configuration
st.set_page_config(
    page_title="SanjeevniAI", 
    layout="centered",
    page_icon="👋",
)

st.title("Welcome to SanjeevniAI")
st.sidebar.success("Choose a portal from the left sidebar")

# Add buttons for switching between pages
col1, col2, col3 = st.columns(3)

with col1:
    if st.button("👨‍⚕️ Doctor Portal"):
        st.switch_page("pages/1_👨‍⚕️_Doctor_Portal.py")

with col2:
    if st.button("🧑‍⚕️ Patient Utility"):
        st.switch_page("pages/2_🧑‍⚕️_Patient_Utility.py")

with col3:
    if st.button("🔍 Verifier Portal"):
        st.switch_page("pages/4_🔍_Verifier_Portal.py")

# Initialize transplant queue if it doesn't exist
if "transplant_queue" not in st.session_state:
    st.session_state.transplant_queue = [
        {"name": "John Doe", "criticality_score": 0.98, "reason": "Heart Failure", "date": "2025-04-13", "time": "10:30 AM"},
        {"name": "Jane Smith", "criticality_score": 0.67, "reason": "Valve Blockage", "date": "2025-04-14", "time": "11:00 AM"},
        {"name": "Mike Johnson", "criticality_score": 0.89, "reason": "Heart Attack", "date": "2025-04-15", "time": "1:30 PM"},
        {"name": "Emily Davis", "criticality_score": 0.90, "reason": "Heart Attack", "date": "2025-04-16", "time": "3:00 PM"}
    ]

# Sort the queue before displaying
st.session_state.transplant_queue = sorted(
    st.session_state.transplant_queue,
    key=lambda x: x["criticality_score"],
    reverse=True
)

# Display the transplant queue in a table
st.subheader("Current Transplant Queue:")

if st.session_state.transplant_queue:
    df_queue = pd.DataFrame(st.session_state.transplant_queue)
    st.table(df_queue)
else:
    st.write("No patients are currently in the transplant queue.")
