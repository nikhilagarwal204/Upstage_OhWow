import os
import pymongo
import pandas as pd
from llama_index.core import Document, StorageContext
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from llama_index.llms.upstage import Upstage
from llama_index.embeddings.upstage import UpstageEmbedding
from llama_index.core.node_parser import SemanticSplitterNodeParser, SentenceSplitter

# Set up environment
os.environ["UPSTAGE_API_KEY"] = "up_*********************"
ATLAS_CONNECTION_STRING = "mongodb+srv://username:password.js1ye.mongodb.net/?retryWrites=true&w=majority&appName=OhWow"

# MongoDB connection details
DB_NAME = "ohwow_pois"
COLLECTION_NAME = "ohwow_wiki"

# Initialize Upstage Embedding model
embed_model = UpstageEmbedding()
llm = Upstage(api_key=os.getenv("UPSTAGE_API_KEY"))

# Primary splitter: Semantic splitting
semantic_splitter = SemanticSplitterNodeParser(
    buffer_size=1,  # Buffer between sentences for semantic cohesion
    embed_model=embed_model,
)

# Fallback splitter: Sentence splitting if the chunk exceeds token limit
sentence_splitter = SentenceSplitter()

# MongoDB Atlas client and vector store initialization
mongodb_client = pymongo.MongoClient(ATLAS_CONNECTION_STRING)
vector_store = MongoDBAtlasVectorSearch(
    mongodb_client=mongodb_client,
    db_name=DB_NAME,
    collection_name=COLLECTION_NAME,
    vector_index_name="vector_index",  # Ensure correct naming convention
)

# Storage context
storage_context = StorageContext.from_defaults(vector_store=vector_store)


def fetch_wiki_data_from_csv():
    """Fetch data from CSV."""
    df = pd.read_csv("./final_wikidata.csv")
    df = df.drop(columns=["level"])  # Drop unnecessary columns
    return df.values.tolist()


def process_and_store_wiki_data(data):
    """Process and store wiki data with embeddings."""
    all_nodes = []
    documents = []

    for row in data:
        (id, name, city, state, country, wiki_data) = row
        document = Document(
            text=wiki_data or "",
            metadata={
                "id": id,
                "name": name,
                "city": city,
                "state": state,
                "country": country,
            },
        )
        documents.append(document)

    for document in documents:
        try:
            # Attempt to split using the semantic splitter
            nodes = semantic_splitter.get_nodes_from_documents(
                [document], show_progress=True
            )
        except:
            try:
                # Fall back to sentence splitter if chunks are too large
                nodes = sentence_splitter.get_nodes_from_documents(
                    [document], show_progress=True
                )
            except:
                print(f"Document {document.metadata['id']} could not be processed.")

        all_nodes.extend(nodes)

    # Embedding each document and updating cost
    embeddings = embed_model.get_text_embedding_batch(
        [node.text for node in all_nodes], show_progress=True
    )

    # Add nodes to the vector store
    storage_context.vector_store.add(all_nodes)
    print(f"Total nodes stored: {len(all_nodes)}")


def main():
    data = fetch_wiki_data_from_csv()
    process_and_store_wiki_data(data)
    print("Wiki data embedding completed.")


if __name__ == "__main__":
    main()
