import os
import pymongo
import time
from llama_index.core import VectorStoreIndex
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.llms.upstage import Upstage
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from llama_index.embeddings.upstage import UpstageEmbedding
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter


def initialize_environment():
    """Set up environment variables and API keys."""
    os.environ["UPSTAGE_API_KEY"] = "up_*********************"


def connect_to_mongodb(connection_string, db_name, collection_name):
    """Connect to MongoDB and return the collection."""
    try:
        client = pymongo.MongoClient(connection_string)
        db = client[db_name]
        collection = db[collection_name]
        print(
            f"Connected to MongoDB collection: {collection.name} in database: {db.name}"
        )
        return collection
    except Exception as e:
        raise ConnectionError(f"Error connecting to MongoDB: {e}")


def create_vector_store(mongodb_client, db_name, collection_name, embed_model):
    """Instantiate and return the MongoDB Atlas Vector Search and Vector Store Index."""
    try:
        vector_store = MongoDBAtlasVectorSearch(
            mongodb_client=mongodb_client,
            db_name=db_name,
            collection_name=collection_name,
        )
        vector_store_index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store, embed_model=embed_model
        )
        print("Vector store index instantiated successfully.")
        return vector_store_index
    except Exception as e:
        raise RuntimeError(f"Error instantiating vector store index: {e}")


def create_query_engine(vector_store_index, llm, city, state, country, top_k=7):
    """Create and return the query engine with metadata filters."""
    metadata_filters = MetadataFilters(
        filters=[
            ExactMatchFilter(key="metadata.city", value=city),
            ExactMatchFilter(key="metadata.state", value=state),
            ExactMatchFilter(key="metadata.country", value=country),
        ]
    )

    # Create the retriever with filters and similarity top_k
    retriever = VectorIndexRetriever(
        index=vector_store_index,
        filters=metadata_filters,
        similarity_top_k=top_k,
    )

    # Return query engine
    return RetrieverQueryEngine.from_args(retriever=retriever, llm=llm)


def run_query(query_engine, query):
    """Run a query on the query engine and return the response."""
    try:
        response = query_engine.query(query)
        if not response or not response.source_nodes:
            print(
                "No relevant documents were retrieved. Please check the query or vector index setup."
            )
        return response
    except Exception as e:
        raise RuntimeError(f"Error during RAG query: {e}")


def display_response(response):
    """Display the response and the source documents used."""
    if response:
        print("\nSource documents used for generating the response:")
        for node in response.source_nodes:
            print(f"Node ID: {node.id_}")
            print(f"Node text: {node.text[:200]}...")
            print(f"Score: {node.score}")
            print("------------------------------------------------")

        print("\nResponse generated by the LLM:")
        print(response)


def main():
    start_time = time.time()

    # Initialize environment
    initialize_environment()

    # MongoDB connection details
    ATLAS_CONNECTION_STRING = "mongodb+srv://username:password.js1ye.mongodb.net/?retryWrites=true&w=majority&appName=OhWow"
    DB_NAME = "ohwow_pois"
    COLLECTION_NAME = "ohwow_wiki"

    # Connect to MongoDB
    collection = connect_to_mongodb(ATLAS_CONNECTION_STRING, DB_NAME, COLLECTION_NAME)
    print(f"Number of documents in the collection: {collection.count_documents({})}")

    # Initialize Upstage LLM and Embedding Model
    embed_model = UpstageEmbedding()
    llm = Upstage(api_key=os.getenv("UPSTAGE_API_KEY"))

    # Create vector store and index
    mongodb_client = pymongo.MongoClient(ATLAS_CONNECTION_STRING)
    vector_store_index = create_vector_store(
        mongodb_client, DB_NAME, COLLECTION_NAME, embed_model
    )

    poi_name = "Pyoseon Beach"
    city, state, country = "Pyoseon-myeon", "Jeju-do", "South Korea"
    # Create the query engine with metadata filters
    query_engine = create_query_engine(vector_store_index, llm, city, state, country)

    # Run the query
    # query = "Write a captivating audio tour guide story about the Jeju Shinhwa World."
    query = f"""
    Location: {poi_name} in {city}, {state}, {country}
    Write content for a 550-650 word text-to-speech audio tour with these chapters: Overview, Facts, History, Insider, Wow, and Nearby. Use clear, concise language (grade 8-10 readability) in inverted pyramid style. Start each chapter with "//// [Chapter Title] ////". Each chapter must score 9+ on engagement, aiming to elicit a "wow" reaction.
    Key instructions:
    Highlight most compelling info first in each chapter.
    Include intriguing "who," "what," "how," or "why" questions and answers.
    Avoid redundant phrases and overusing the location's name.
    Add funny factoids if relevant.
    If it's a memorial, focus on the person commemorated; if a museum, discuss the founder; for parks, note key events.
    Mention hours of operation if applicable.
    Write the score as: /// Score = ///"
    """
    response = run_query(query_engine, query)

    # Display the response
    display_response(response)

    # Display the execution time
    print(f"Time taken: {time.time() - start_time:.2f} seconds")


if __name__ == "__main__":
    main()
