import requests
import mwparserfromhell
import psycopg2
import re
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage
from langchain_core.output_parsers import StrOutputParser
import pandas as pd

# Connect to the database
connection = psycopg2.connect(
    dbname="",
    user="",
    password="",
    host="",
    port="",
)
cursor = connection.cursor()

upstage_key = ""

headers = {"User-Agent": "OhWow/1.0 (khushi@ohwowapp.com)"}
S = requests.Session()
URL = "https://ko.wikipedia.org/w/api.php"

koen_translation = ChatUpstage(
    model="solar-1-mini-translate-koen", upstage_api_key=upstage_key, temperature=0.5
)

chat_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{text}"),
    ]
)
chain = chat_prompt | koen_translation | StrOutputParser()


def translate_text(localname, engname, text):
    if engname != "":
        translated_name = engname
    else:
        translated_name = chain.invoke({"text": f"{localname}"})
    translated_text = chain.invoke({"text": f"{text}"})
    return translated_name, translated_text


def get_wiki_pageid(localname):

    PARAMS = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": localname,
    }

    R = S.get(url=URL, params=PARAMS, headers=headers)
    DATA = R.json()

    return DATA["query"]["search"][0]["pageid"]


def filter_main_content(text):
    pattern = re.compile(
        r"(==\s*(각주|같이 보기|외부 링크|갤러리)\s*==)", re.IGNORECASE
    )

    match = pattern.search(text)
    return text[: match.start()].strip() if match else text.strip()


def get_wiki_content(page_id):

    PARAMS = {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "pageids": page_id,
        "rvslots": "main",
        "rvprop": "content",
        "formatversion": "2",
    }

    R = S.get(url=URL, params=PARAMS, headers=headers)
    DATA = R.json()

    PAGES = DATA["query"]["pages"]
    for page in PAGES:
        revisions = page["revisions"]
        for revision in revisions:
            content = revision["slots"]["main"]["content"]
            filtered_content = filter_main_content(content)
            wikicode = mwparserfromhell.parse(filtered_content)

    return wikicode.strip_code()


cursor.execute(
    "SELECT localname, id, city, state, country, name FROM -- WHERE country = 'South Korea'"
)
rows = cursor.fetchall()

ids_no_info = []
data_list = []

for row in rows:
    localname, poi_id, city, state, country, name = row

    try:
        page_id = get_wiki_pageid(localname)
        content = get_wiki_content(page_id)
        translated_name, translated_content = translate_text(localname, name, content)

        data_list.append(
            {
                "english_name": translated_name,
                "korean_name": localname,
                "id": poi_id,
                "location": f"{city}, {state}, {country}",
                "poi_info": f"{translated_name} in {city}, {state}, {country}.",
                "content": translated_content,
            }
        )

    except Exception as e:
        print(f"Error: {e}")
        ids_no_info.append(poi_id)
        continue

df = pd.DataFrame(data_list)
df.to_csv("jejuwiki_data.csv", index=False)

with open("info_not_available.txt", mode="w") as f:
    for item in ids_no_info:
        f.write(f"{item}\n")

cursor.close()
connection.close()
print("DONE!")
