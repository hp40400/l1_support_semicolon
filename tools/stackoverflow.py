import requests
import csv
# Set up the API endpoint and parameters
url = "https://api.stackexchange.com/2.3/questions"
params = {
    "order": "desc",
    "sort": "votes",
    "tagged": "keycloak",
    "site": "stackoverflow",
    "filter": ".BBYjEf5A18Jy2nkW)OaDBa3kp_C-KyvU02PwDPf3TCxL.)hLPHh8iGPJWbywx2)Zz8Vyaj6.yfPJHG",
    "page": 1,
    "per_page": 100
}

# Include your API key in the headers
headers = {
    "User-Agent": "MyApp/1.0",
    "X-API-Key": "XSxstsjZ4fc9nPmJtFTYQg(("
}

with open('keycloak.csv','a') as tempLog:
    csv.writer(tempLog).writerow(["QuestionId","QuestionTitle", "QuestionBody", "AcceptedAnswerId", "AcceptedAnswerBody"])
  
count = 0
while True:
  count += 1;
  print("api invocation :>>>>>>>>> ", count);
  # Make the authenticated API request
  response = requests.get(url, params=params, headers=headers)
  data = response.json()

  for question in data["items"]:
    if "accepted_answer_id" in question:
      for answer in question["answers"]:
        if(question["accepted_answer_id"] == answer["answer_id"]):
          answer = answer["body_markdown"]
          break
      # print(question["question_id"], ",", question["title"], ",", question["accepted_answer_id"], ",", answer)
      with open('keycloak.csv','a') as tempLog:
          csv.writer(tempLog).writerow([question["question_id"],question["title"],question["body_markdown"],question["accepted_answer_id"],answer])

  if data["has_more"]:
    params["page"] += 1
  else:
    print("All results are collected.")
    break;