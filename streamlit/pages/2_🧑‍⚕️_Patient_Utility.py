import streamlit as st
from datetime import datetime, time
import pandas as pd
import os

st.title("🧑‍⚕️ Patient Utility")
st.write("Book an appointment with a specialist:")

doctors = [
    {"name": "Dr. Arjun Mehta", "specialization": "Heart Specialist", "contact": "arjun.heart@hospital.com"},
    {"name": "Dr. Riya Kapoor", "specialization": "Lung Specialist", "contact": "riya.lung@hospital.com"},
    {"name": "Dr. Neeraj Sharma", "specialization": "Kidney Specialist", "contact": "neeraj.kidney@hospital.com"},
]

# Appointment form
patient_name = st.text_input("Your Name")
reason = st.text_input("Reason for Appointment")
date = st.date_input("Choose a Date")
time_slot = st.time_input("Choose a Time")

for doc in doctors:
    with st.container():
        st.subheader(doc["name"])
        st.write(f"🩺 {doc['specialization']}")
        st.write(f"📧 {doc['contact']}")

        if st.button(f"Book Appointment with {doc['name']}"):
            if not patient_name or not reason:
                st.warning("Please fill all the details before booking.")
            else:
                appointment = {
                    "doctor_email": doc["contact"],
                    "doctor_name": doc["name"],
                    "patient": patient_name,
                    "reason": reason,
                    "date": date.strftime("%Y-%m-%d"),
                    "time": time_slot.strftime("%H:%M"),
                }
                # Save to CSV
                df = pd.DataFrame([appointment])
                if not os.path.exists("appointments.csv"):
                    df.to_csv("appointments.csv", index=False)
                else:
                    df.to_csv("appointments.csv", mode="a", header=False, index=False)
                st.success(f"Appointment booked with {doc['name']} on {appointment['date']} at {appointment['time']}")
        st.markdown("---")
