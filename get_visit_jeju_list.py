import requests
import csv


def fetch_data(page):
    url = f"https://api.visitjeju.net/vsjApi/contents/searchList?apiKey=b9fcdac49cc242019bc3f480c995a910&locale=en&page={page}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data for page {page}: {response.status_code}")
        return None


def extract_poi_info(items):
    poi_data = [
        {
            'contentsid': item.get('contentsid'),
            'title': item.get('title'),
            'category': (item.get('contentscd') or {}).get('label'),
            'city': (item.get('region1cd') or {}).get('label'),
            'region': (item.get('region2cd') or {}).get('label'),
            'address': item.get('address'),
            'road_address': item.get('roadaddress'),
            'intro': item.get('introduction'),
            'lat': item.get('latitude'),
            'lon': item.get('longitude'),
            'postcode': item.get('postcode'),
            'phone_no': item.get('phoneno'),
            'img_desc': (item.get('repPhoto') or {}).get('descseo'),
            'imgpath': (item.get('repPhoto') or {}).get('photoid', {}).get('imgpath')
        }
        for item in items
    ]


    return poi_data


def main():
    all_poi_data = []

    for page in range(1, 26):
        data = fetch_data(page)
        if data and data["result"] == "200":
            items = data.get("items", [])
            poi_info = extract_poi_info(items)
            all_poi_data.extend(poi_info)

    keys = [
        "contentsid",
        "title",
        "category",
        "city",
        "region",
        "address",
        "road_address",
        "intro",
        "lat",
        "lon",
        "postcode",
        "phone_no",
        "img_desc",
        "imgpath",
    ]
    with open("visit_jeju_data.csv", mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=keys)
        writer.writeheader()
        writer.writerows(all_poi_data)


if __name__ == "__main__":
    main()
