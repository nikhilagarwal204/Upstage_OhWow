
# Oh Wow: AI-Powered Audio Guide App

Welcome to the GitHub repository for **Oh Wow**, an innovative AI-powered audio guide app designed to offer immersive and engaging narratives for over a million global destinations. This repository contains the essential code and datasets used to develop the backend and frontend of the app, as well as the fine-tuning and inference processes for generating high-quality, location-based content.

## Repository Contents

### 1. Web Application

-   **ohwow-web**  
    Minified Web version Next.js code for the Oh Wow app. This codebase powers the frontend of the web application, providing users with an interactive interface to explore points of interest (POIs) and listen to AI-generated stories.

### 2. Fine-Tuning, RAG, and Inference

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
    

## Usage

1.  **Web Application**  
    Clone the repository and run the `ohwow-web` code to deploy the Next.js web app locally.
    
2.  **Fine-Tuning & Inference**  
    Use the `finetune_predibase_solarllm.py` and `RAG_Embedding_Inference.py` scripts to fine-tune the model and run RAG-based inference on the prepared datasets.
    
3.  **Data Scraping**  
    Execute the `get_visit_jeju_content.py`, `get_visit_jeju_list.py`, and `get_wiki_data.py` scripts to scrape and prepare your own datasets for further fine-tuning and content generation.
