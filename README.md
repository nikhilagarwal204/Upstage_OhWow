# Oh Wow: AI-Powered Audio Guide App

Welcome to the GitHub repository for **Oh Wow**, an innovative AI-powered audio guide app designed to offer immersive and engaging narratives for over a million global destinations. This repository contains the essential code and datasets used to develop the backend and frontend of the app, as well as the fine-tuning and inference processes that we experimented and finally went with Upstage Embeddings based RAG for generating high-quality, place-based content.

## Repository Contents

### 1. Web Application

-   **ohwow-web**  
    Minified Web version Next.js code for the Oh Wow app. This codebase powers the frontend of the web application, providing users with an interactive interface to explore points of interest (POIs) and listen to AI-generated stories.

-   **ask-ohwow**  
    Nextjs + FastaAPI Python backend to empower Visual AI tour guide to ask any more questions related to any POI

### 2. Fine-Tuning, RAG, and Inference

-   **new_store_wikidata_upstage-embeddings_mongo.py**  
    This script processes and stores Wikipedia data with embeddings in MongoDB Atlas using Upstage's embedding model. It reads POI data from a CSV file, splits the text into smaller, semantically-cohesive nodes, and stores the nodes with embeddings in a MongoDB vector store for efficient retrieval.
    
-   **new_rag_content_generation.py**  
    This script retrieves relevant documents from MongoDB using metadata filters and Upstage's LLM for Retrieval-Augmented Generation (RAG). It filters documents based on city, state, and country, runs a query on the relevant POI data, and generates engaging audio tour content for that location.

-   **RAG_Embedding_Inference.py**  
    Python script demonstrating the process of Retrieval-Augmented Generation (RAG) and inference, crucial for improving the accuracy and quality of the AI-generated stories.
    
-   **finetune_predibase_solarllm.py**  
    Code used to fine-tune the Solar LLM model via Predibase SDK. This script handles hyperparameter tuning and other configurations to optimize the model for generating high-quality content.
    

### 3. Data Scraping & Dataset Preparation

-   **get_visit_jeju_content.py**  
    Script for scraping POI content from the VisitJeju website. It processes the raw data and prepares it for use in fine-tuning the LLM model.
    
-   **get_visit_jeju_list.py**  
    Script for obtaining a list of POIs from the VisitJeju website, essential for ensuring comprehensive coverage in the dataset.
    
-   **get_wiki_data.py**  
    Python script to fetch data from Wikipedia using the Wikipedia API. This script gathers foundational data on POIs, which is later enhanced with additional information.
    

### 4. Sample Datasets

-   **sample_jejuwiki_data.csv**  
    Sample dataset containing POI data from Wikipedia. Used for initial fine-tuning of the Solar Mini model.
    
-   **sample_visit_jeju_rag.csv**  
    Sample dataset prepared from VisitJeju data. Utilized in RAG to improve the quality and relevance of the generated stories.
