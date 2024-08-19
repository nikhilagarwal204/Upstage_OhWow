import csv
import pandas as pd
from predibase import Predibase, FinetuningConfig

# Setup Predibase API
api_token = "pb_*************"
pb = Predibase(api_token=api_token)

# Load your CSV dataset
csv_file_name = "./sample_jejuwiki_data.csv"

# Read the CSV data
df = pd.read_csv(csv_file_name)


# Define a function to convert DataFrame to CSV with prompts for fine-tuning
def df_to_csv_for_pb(dataframe, output_csv_file):
    template = {
        "prompt": """<|im_start|>user\n Location: {poi_info}. Write content about the location. <|im_end|>\n<|im_start|>assistant\n""",
        "completion": "{content} <|im_end|>",
    }

    with open(output_csv_file, "w", newline="") as csvfile:
        fieldnames = template.keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for _, row in dataframe.iterrows():
            row_data = {
                "prompt": template["prompt"].format(poi_info=row["poi_info"]),
                "completion": template["completion"].format(content=row["content"]),
            }
            writer.writerow(row_data)


# Process and save training data
train_csv_file_name = "./train_jejuwiki_data.csv"
df_to_csv_for_pb(df, train_csv_file_name)


# Validate CSV data
def validate_data_csv(csv_file_name):
    """Ensure it has prompt, completion with all values"""
    with open(csv_file_name, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            assert row["prompt"]
            assert row["completion"]
    return True


# Validate train and test datasets
print(f"Train Dataset Validation: {validate_data_csv(train_csv_file_name)}")

# Calculate cost of fine-tuning
from tokenizers import Tokenizer

tokenizer = Tokenizer.from_pretrained("upstage/solar-1-mini-tokenizer")


def compute_cost(csv_file_name, price_per_million_tokens=0.5):
    """Compute the cost of the dataset"""
    total_num_of_tokens = 0
    with open(csv_file_name, "r") as f:
        reader = csv.DictReader(f)
        values = [row["completion"] + " " + row["prompt"] for row in reader]
        for value in values:
            enc = tokenizer.encode(value)
            num_of_tokens = len(enc.tokens)
            total_num_of_tokens += num_of_tokens
    return total_num_of_tokens / 1000000 * price_per_million_tokens


# Compute cost for training dataset
print(f"One step FT Cost: {compute_cost(train_csv_file_name)} USD")

dataset_name = "wikidata_jeju"
# Check if dataset already exists in Predibase, if not create it
try:
    pb_dataset = pb.datasets.get(dataset_name)
    print(f"Dataset found: {pb_dataset}")
except RuntimeError:
    print("Dataset not found, creating...")
    pb_dataset = pb.datasets.from_file(train_csv_file_name, name=dataset_name)
    print(f"Dataset created: {pb_dataset}")

# Fine-tuning the model
repo_name = "jeju-info-model"
repo = pb.repos.create(
    name=repo_name, description="ko Wikidata of Jeju POIs", exists_ok=True
)
print(repo)

# Start a fine-tuning job, blocks until training is finished
adapter = pb.adapters.create(
    config=FinetuningConfig(
        base_model="solar-1-mini-chat-240612",
        epochs=8,  # default: 3
        rank=32,  # default: 16
        learning_rate=0.0002,  # default: 0.0002
    ),
    dataset=pb_dataset,
    repo=repo,
    description="Wikidata Jeju POIs, Config changed",
)

adapter_id = adapter.repo + "/" + str(adapter.tag)
print(f"Adapter ID: {adapter_id}")

# Get adapter, blocking call if training is still in progress
adapter = pb.adapters.get(adapter_id)
print(adapter)
