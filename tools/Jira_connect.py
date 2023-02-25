# import the installed Jira library
from jira import JIRA
import csv
  
# Specify a server key. It should be your
# domain name link. yourdomainname.atlassian.net
jiraOptions = {'server': "https://issues.redhat.com/"}
  
# Get a JIRA client instance
jira = JIRA(options=jiraOptions)

# Key, Subject, description
with open('keycloak_jira.csv','a') as tempLog:
    csv.writer(tempLog).writerow(["Key","Subject", "Description"])
  
# Search all issues mentioned against a project name.
jql_str = 'project = KEYCLOAK AND status = Resolved and resolution = Done'
for singleIssue in jira.search_issues(jql_str, maxResults=500, startAt=0):
    key=singleIssue.key
    subject=singleIssue.fields.summary
    description=singleIssue.fields.description
    with open('keycloak_jira.csv','a') as tempLog:
        csv.writer(tempLog).writerow([key, subject, description])
