import pandas as pd
import numpy as np

# Step 1: Load data
df = pd.read_csv('data/heart_transplants.csv')

# Step 2: Preprocess Data
df = df.dropna()  # Drop rows with missing values (or handle it differently if needed)

# Features and target
X = df[['heart Attack', 'Cardiomyopathy', 'Heart Valve', 'Heart Defect at birth', 'Age', 'Bp']].values
y = df['Needed_or_not'].map({'yes': 1, 'no': 0}).values  # Convert 'yes'/'no' to 1/0

# Step 3: Add an intercept column (ones) to the feature matrix
X = np.column_stack([np.ones(X.shape[0]), X])  # Add a column of 1's for the intercept

# Step 4: Calculate coefficients using the OLS formula: beta = (X^T X)^-1 X^T y
X_transpose = X.T
X_transpose_X = np.dot(X_transpose, X)
X_transpose_X_inv = np.linalg.inv(X_transpose_X)  # Inverse of (X^T X)
beta = np.dot(np.dot(X_transpose_X_inv, X_transpose), y)  # Coefficients (including intercept)

# Step 5: Output coefficients
coeff_dict = {
    'intercept': beta[0],  # Intercept (first element)
    'heart_attack': beta[1],
    'cardiomyopathy': beta[2],
    'heart_valve': beta[3],
    'heart_defect': beta[4],
    'age': beta[5],
    'bp': beta[6]
}

# Convert the coefficients to JSON format
import json
coeff_json = json.dumps(coeff_dict, indent=4)

# Output the coefficients
print("Model Coefficients (JSON):")
print(coeff_json)
