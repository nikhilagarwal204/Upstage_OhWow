import requests
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage
from langchain_core.output_parsers import StrOutputParser
import pandas as pd

upstage_key = ""

csv_file_path = "test_data - Sheet1.csv"
data = pd.read_csv(csv_file_path)

koen_translation = ChatUpstage(
    model="solar-1-mini-translate-koen", upstage_api_key=upstage_key, temperature=0.5
)

chat_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{text}"),
    ]
)
chain = chat_prompt | koen_translation | StrOutputParser()


def translate_text(text):
    translated_text = chain.invoke({"text": f"{text}"})
    return translated_text


def fetch_details(contents_id, category):
    category_keyword_map = {
        "Accommodations": "lodgmentcontents",
        "Restaurant": "restaurantcontents",
        "Tourist Destination": "tourcontents",
        "Shopping": "shoppingcontents",
        "Festivals/Events": "festivalcontents",
    }
    keyword = category_keyword_map.get(category)

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.visitjeju.net/",
        "Origin": "https://www.visitjeju.net",
    }

    url = f"https://api.visitjeju.net/api/node/{keyword}/read.json?id={contents_id}&locale=en"
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        response_json = response.json()
        items = response_json.get("item", {})

        if items:
            data = items.get("contentsid", {}).get("item", {})
            poi_name = data.get("title", "")
            print(
                f"POI Name: {poi_name}, Category: {category}, Contents ID: {contents_id}"
            )
            info = data.get("sbst")
            location = (
                f"{data.get('region2cd', {}).get('label', '')}, Jeju-do, South Korea"
            )
            amenities_list = data.get("convenience", [])
            amenities_str = (
                ", ".join([amenity.get("label", "") for amenity in amenities_list])
                if amenities_list
                else ""
            )

            timings = data.get("usedescinfo")

            if not info:
                info = ""

            if amenities_str and amenities_str != "":
                info += f"\n\nAmenities: {amenities_str}"
            if timings:
                info += f"\n\nTimings: {timings}"

            return poi_name, info, location

    return None, None, None


def fetch_reviews(contents_id):
    reviews_list = []
    page = 1
    likecnt = reviewcnt = 0  # Initialize as 0 or appropriate default

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.visitjeju.net/",
        "Origin": "https://www.visitjeju.net",
    }

    while True:
        url = f"https://api.visitjeju.net/api/contentsreview/list.json?&locale=en&contentsid={contents_id}&sorting=created+desc&page={page}"
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break

        data = response.json()
        items = data.get("items", [])

        if items:
            reviews_list.extend(
                [item["evelcontent"] for item in items if item["evelcontent"]]
            )

            if likecnt == 0 and reviewcnt == 0:
                first_item_contentsid = items[0].get("contentsid", {})
                likecnt = first_item_contentsid.get("likecnt", 0)
                reviewcnt = first_item_contentsid.get("reviewcnt", 0)

            page += 1
            if page > data.get("pageCount", page):
                break
        else:
            return "Nobody reviewed this place yet", None

    reviews = "\n\n".join(reviews_list)
    translated_reviews = [translate_text(reviews)]
    return (
        "\n\n".join(translated_reviews),
        f"Number of people liked this POI: {likecnt}\nNumber of reviews: {reviewcnt}",
    )


results = []
for index, row in data.iterrows():
    if row["category"] != "Theme Travel":
        try:
            (
                poi_name,
                info,
                location,
            ) = fetch_details(row["contentsid"], row["category"])
            reviews, like_review_cnt = fetch_reviews(row["contentsid"])

            results.append(
                {
                    "poi_name": poi_name,
                    "location": location,
                    "poi_info": info,
                    "reviews": reviews,
                    "like_review_cnt": like_review_cnt,
                }
            )
        except Exception as e:
            print(f"Error: {e}")
            continue


data = pd.DataFrame(results)
data.to_csv("visit_jeju_rag.csv", index=False)

print("DONE!")
