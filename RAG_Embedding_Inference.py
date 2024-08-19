import os
import pandas as pd
import chromadb
from llama_index.core import (
    ServiceContext,
    StorageContext,
    VectorStoreIndex,
    set_global_service_context,
    Document,
)
from llama_index.llms.predibase import PredibaseLLM
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.upstage import UpstageEmbedding

# Set environment variables for API tokens
os.environ["UPSTAGE_API_KEY"] = "up_*************"
os.environ["PREDIBASE_API_TOKEN"] = "pb_*************"

# Step 1: Load CSV data
csv_file_path = "./sample_visit_jeju_rag.csv"
df = pd.read_csv(csv_file_path)
print(f"Number of rows in the CSV file: {len(df)}")
print(df.head())

# Step 2: Preprocess the data: Combine fields into a structured narrative
df["narrative"] = df.apply(
    lambda row: f"Location: {row['poi_name']} in {row['location']}\n"
    f"Description: {row['poi_info']}\n"
    f"Likes and Reviews Count: {row['like_review_cnt']}\n"
    f"Reviews: {row['reviews']}",
    axis=1,
)

# Create Document objects with poi_name & poi_location as metadata for better querying
documents = [
    Document(
        text=narrative,
        metadata={"poi_name": row.poi_name, "poi_location": row.location},
    )
    for narrative, row in zip(df["narrative"], df.itertuples())
]
print(f"Number of documents: {len(documents)}")

# Step 3: Configure Upstage LLM and Embedding Model
llm = PredibaseLLM(
    model_name="solar-1-mini-chat-240612",
    adapter_id="jeju-info-model",
    adapter_version=1,
    api_token=os.environ.get("PREDIBASE_API_TOKEN"),
    temperature=0.3,
    max_new_tokens=600,
)

embed_model = UpstageEmbedding(model="solar-embedding-1-large")

# Step 4: Create a ServiceContext
ctx = ServiceContext.from_defaults(llm=llm, embed_model=embed_model)
set_global_service_context(ctx)

# Step 5: Set up Chroma with persistent storage
# Specify a directory for Chroma DB persistence
persist_directory = "./chroma_db"

# Initialize Chroma client with persistence
chroma_client = chromadb.PersistentClient(path=persist_directory)
chroma_collection = chroma_client.get_or_create_collection("jeju_pois_collection")

print(f"Number of documents in the collection: {chroma_collection.count()}")

vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# Check if documents are already indexed, if not, index them
if chroma_collection.count() == 0:
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
else:
    index = VectorStoreIndex(storage_context=storage_context)

print("Indexing complete!")
print(f"Number of documents in the collection: {chroma_collection.count()}")

# Step 6: Query the relevant POI directly
query_engine = index.as_query_engine()

# Example of a direct query using POI information
poi_query = "Jeju National Museum in Geonip-dong, Jeju-do, South Korea"
response = query_engine.query(
    f"Location: {poi_query}\n"
    "Write content for a text to speech audio tour about this location.\n Include overview, facts, history, and interesting stories as different sections with headings."
    # the prompt is even bigger, but we're just showing a snippet here
)

# Print the retrieved response
print(response)
