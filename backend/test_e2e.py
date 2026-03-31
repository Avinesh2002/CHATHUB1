import requests

print("Uploading...")
res_upload = requests.post(
    'http://127.0.0.1:5000/upload',
    files={'files': ('test.txt', b'The secret password is: 42')}
)
print("Upload status:", res_upload.status_code)
print(res_upload.json())

if res_upload.status_code == 200:
    print("Chatting...")
    res_chat = requests.post(
        'http://127.0.0.1:5000/chat',
        json={'query': 'What is the secret password?'}
    )
    print("Chat status:", res_chat.status_code)
    print(res_chat.json())
