import streamlit as st

# Password for Verifier Portal
VERIFIER_PASSWORD = "securepassword123"  # Change this to a strong password

def main():
    # Set up page configuration
    st.set_page_config(page_title="Verifier Portal", layout="centered")
    st.title("Verifier Portal")
    
    # Check if the user is already authenticated via session state
    if "authenticated" in st.session_state and st.session_state["authenticated"]:
        # If the user is authenticated, show the Verifier Portal content
        st.write("This portal is meant for third-party verifiers to validate records and check organ urgency queue integrity.")

        # Check if the necessary data is in session state
        if "severity_score" in st.session_state and "urgency_code" in st.session_state:
            patient_info = st.session_state["patient_info"]
            severity_score = st.session_state["severity_score"]
            urgency_code = st.session_state["urgency_code"]

            st.subheader("Patient Information")
            st.write(f"**Patient Name**: {patient_info['name']}")
            st.write(f"**Reason**: {patient_info['reason']}")
            st.write(f"**Date**: {patient_info['date']}")
            st.write(f"**Time**: {patient_info['time']}")

            st.subheader("Severity Evaluation")
            st.write(f"**Severity Score**: {severity_score:.10f}")
            st.write(f"**Urgency Code**: {urgency_code}")
            
            # Add buttons for approval/rejection
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Yes, Approve"):
                    st.session_state["verification_status"] = "approved"
                    st.success("✅ Evaluation Approved! The doctor will be notified.")
                with col2:
                    if st.button("No, Reject"):
                        st.session_state["verification_status"] = "rejected"
                        st.warning(f"❌ Evaluation Rejected! The doctor will be notified.")

                        # Prompt the doctor for rejection status
                        if "selected_patient" in st.session_state:
                            doctor_message = f"Patient {st.session_state.selected_patient}'s evaluation has been rejected. Please review the application again."
                            st.session_state["doctor_message"] = doctor_message
                            st.success("The doctor has been notified of the rejection.")

        else:
            st.warning("No evaluation data found. Please complete the evaluation first.")

    else:
        # Password input if not authenticated
        st.subheader("Please Enter the Verifier Portal Password")
        password = st.text_input("Password", type="password")
        
        # Check if the password matches
        if password == VERIFIER_PASSWORD:
            st.session_state["authenticated"] = True
            st.success("Authenticated successfully!")
            st.rerun()  # Rerun to refresh the page and show the portal content
        elif password:
            st.error("Incorrect password. Please try again.")

if __name__ == "__main__":
    main()
