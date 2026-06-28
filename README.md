# Maverick Execution Platform

## Setting Up the Project
### Clone this repository.
```console
git clone https://github.com/kishlaykiku/MEP.git
```
### This Project Runs on Node.js 24.
```console
https://nodejs.org/en/download
```
```console
1. Download the Node 24 LTS version standalone installer(.zip)
2. Extract the node version in `<Path_To_Cloned_Repo_Directory/MEP/backend/node`
```
### Setup Environment Variables (Backend Only)
```console
cd <Path_To_Cloned_Repo_Directory/MEP/backend>
Create .env file according to the .env.example file
```

## Installation and Usage
### Start the application.
#### Backend
```console
cd <Path_To_Cloned_Repo_Directory/MEP/backend>
./start-dev.ps1
```
*Note: This will set the node version for the current terminal instance and install all the dependecies followed by starting the server*
#### Frontend
```console
cd <Path_To_Cloned_Repo_Directory/MEP/frontend>
./start-dev.ps1
```
*Note: This will install all the dependecies followed by starting the server*
#### View
Ping `http://localhost:5173` in your browser to access the application.

<hr>
