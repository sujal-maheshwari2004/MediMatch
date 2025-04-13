import streamlit as st
import pandas as pd
import os

st.set_page_config(page_title="Doctor's Portal", layout="centered")
st.title("👨‍⚕️ Doctor's Portal")

# Dummy credentials
doctors_db = {
    "arjun.heart@hospital.com": {"name": "Dr. Arjun Mehta", "specialization": "Heart Specialist", "password": "heart123"},
    "riya.lung@hospital.com": {"name": "Dr. Riya Kapoor", "specialization": "Lung Specialist", "password": "lung123"},
    "neeraj.kidney@hospital.com": {"name": "Dr. Neeraj Sharma", "specialization": "Kidney Specialist", "password": "kidney123"},
}

if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "doctor_email" not in st.session_state:
    st.session_state.doctor_email = ""

# Initialize transplant queue with dummy values if it doesn't exist
if "transplant_queue" not in st.session_state:
    st.session_state.transplant_queue = [
        {"name": "John Doe", "criticality_score": .856, "reason": "Heart Failure", "date": "2025-04-13", "time": "10:30 AM"},
        {"name": "Jane Smith", "criticality_score": .924, "reason": "Liver Cirrhosis", "date": "2025-04-14", "time": "11:00 AM"},
        {"name": "Mike Johnson", "criticality_score": .881, "reason": "Kidney Failure", "date": "2025-04-15", "time": "1:30 PM"},
        {"name": "Emily Davis", "criticality_score": .805, "reason": "Heart Attack", "date": "2025-04-16", "time": "3:00 PM"}
    ]
    # Sort the queue by criticality score (descending order)
    st.session_state.transplant_queue = sorted(st.session_state.transplant_queue, key=lambda x: x["criticality_score"], reverse=True)

if not st.session_state.logged_in:
    st.subheader("Login")
    email = st.text_input("Email")
    password = st.text_input("Password", type="password")
    if st.button("Login"):
        if email in doctors_db and doctors_db[email]["password"] == password:
            st.session_state.logged_in = True
            st.session_state.doctor_email = email
            st.success("Login successful.")
        else:
            st.error("Invalid credentials.")

if st.session_state.logged_in:
    doc_info = doctors_db[st.session_state.doctor_email]
    st.subheader(f"Welcome, {doc_info['name']} ({doc_info['specialization']})")
    st.write("📋 Your Appointments:")

    # Display the notification if it exists in session state
    if "verification_status" in st.session_state:
        if st.session_state["verification_status"] == "approved":
            st.success("✅ The evaluation has been approved by the verifier.")
            # Add button for confirmation by the patient
            if st.button("Confirmed by Patient - Ready for Transplant"):
                # Assuming criticality score is part of patient data (this can be calculated as per requirement)
                criticality_score = st.session_state.get("severity_score", 0)  # Use severity score as criticality score

                # Add patient to the transplant queue
                patient_info = {
                    "name": st.session_state.get("selected_patient", "Unknown"),
                    "criticality_score": criticality_score,
                    "reason": st.session_state.get("selected_reason", "Unknown"),
                    "date": st.session_state.get("selected_date", "Unknown"),
                    "time": st.session_state.get("selected_time", "Unknown")
                }
                
                # Add patient to the queue and re-rank
                st.session_state.transplant_queue.append(patient_info)
                # Sort by criticality score in descending order (higher score = higher priority)
                st.session_state.transplant_queue = sorted(st.session_state.transplant_queue, key=lambda x: x["criticality_score"], reverse=True)
                
                st.success("✅ Patient is confirmed as ready for transplant. They have been added to the transplant queue.")
                
                # Display the updated transplant queue
                st.subheader("Current Transplant Queue:")
                for patient in st.session_state.transplant_queue:
                    st.write(f"**{patient['name']}** - Criticality Score: {patient['criticality_score']} | Reason: {patient['reason']}")

        elif st.session_state["verification_status"] == "rejected":
            if "doctor_message" in st.session_state:  # Check if the rejection message exists
                st.warning(st.session_state["doctor_message"])  # Show the rejection message
            else:
                st.warning("❌ The evaluation has been rejected by the verifier.")
        del st.session_state["verification_status"]  # Optionally clear the status after it's shown
        # Clear the rejection message only if it exists
        if "doctor_message" in st.session_state:
            del st.session_state["doctor_message"]

    if os.path.exists("appointments.csv"):
        df = pd.read_csv("appointments.csv")
        doc_appointments = df[df["doctor_email"] == st.session_state.doctor_email]

        if not doc_appointments.empty:
            for i, row in doc_appointments.iterrows():
                st.markdown(f"""
                **Patient:** {row['patient']}  
                📝 **Reason:** {row['reason']}  
                📅 **Date:** {row['date']}  
                🕒 **Time:** {row['time']}
                """)

                if st.button(f"Upload Documents for {row['patient']} - {row['date']} at {row['time']}", key=f"upload_{i}"):
                    # Save appointment info in session state to access in 4_sanjeevniAI.py
                    st.session_state.selected_patient = row['patient']
                    st.session_state.selected_reason = row['reason']
                    st.session_state.selected_date = row['date']
                    st.session_state.selected_time = row['time']
                    st.switch_page("pages/3_🧬_sanjeevniAI.py")

                st.markdown("---")
        else:
            st.info("No appointments yet.")
    else:
        st.info("No appointments file found.")

    if st.button("Logout"):
        st.session_state.logged_in = False
        st.session_state.doctor_email = ""
        st.rerun()
