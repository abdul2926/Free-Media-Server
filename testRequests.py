import requests

url = 'http://localhost:8000/'
obj = {'test': 'test string'}

response = requests.post(url, data=obj)

print(response.text)