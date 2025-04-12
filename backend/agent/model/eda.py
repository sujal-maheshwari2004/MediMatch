import pandas as pd

# Load the CSV file
df = pd.read_csv("data/Organ_Transplant.csv")

# Normalize the 'Transplant' column
df['Transplant'] = df['Transplant'].str.lower().str.strip()
df['Transplant'] = df['Transplant'].replace({'kideny': 'kidney'})  # fix typo

# Split multiple organ entries into separate rows
df_expanded = df.assign(Transplant=df['Transplant'].str.split('-')).explode('Transplant')

# Merge 'lung' and 'lungs'
df_expanded['Transplant'] = df_expanded['Transplant'].replace({'lungs': 'lung'})

# Remove 'none' entries
df_filtered = df_expanded[df_expanded['Transplant'] != 'none'].reset_index(drop=True)

# Separate and save each organ-specific DataFrame
organs = df_filtered['Transplant'].unique()
for organ in organs:
    organ_df = df_filtered[df_filtered['Transplant'] == organ].reset_index(drop=True)
    organ_df.to_csv(f"{organ}_transplants.csv", index=False)

print("Organ-specific CSV files saved!")